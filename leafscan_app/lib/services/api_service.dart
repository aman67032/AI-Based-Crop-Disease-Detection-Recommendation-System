import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mime/mime.dart';
import '../config/api_config.dart';
import '../models/detection.dart';
import '../models/history_item.dart';
import '../models/user.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String get baseUrl => ApiConfig.baseUrl;

  // ─── Token Management ────────────────────────────────────

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('kisan_token');
  }

  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('kisan_token', token);
  }

  Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('kisan_token');
  }

  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await getToken();
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // ─── Health Check ────────────────────────────────────────

  Future<Map<String, dynamic>> healthCheck() async {
    final res = await http.get(Uri.parse('$baseUrl/health'))
        .timeout(ApiConfig.timeout);
    return jsonDecode(res.body);
  }

  // ─── Disease Detection ───────────────────────────────────

  Future<DetectResponse> detectDisease(File imageFile, {String cropType = '', String language = 'en'}) async {
    final token = await getToken();
    final uri = Uri.parse('$baseUrl/api/detect');
    final request = http.MultipartRequest('POST', uri);

    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    final mimeType = lookupMimeType(imageFile.path) ?? 'image/jpeg';
    final parts = mimeType.split('/');

    request.files.add(await http.MultipartFile.fromPath(
      'file',
      imageFile.path,
      contentType: http.MultipartFile.fromPath(
        'file',
        imageFile.path,
      ).then((_) => null) is Future ? null : null,
    ));

    // Simpler approach - just add the file
    request.files.clear();
    request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));
    request.fields['crop_type'] = cropType;
    request.fields['language'] = language;

    final streamedRes = await request.send().timeout(const Duration(seconds: 60));
    final res = await http.Response.fromStream(streamedRes);

    if (res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['detail'] ?? 'Detection failed');
    }

    return DetectResponse.fromJson(jsonDecode(res.body));
  }

  // ─── Recommendation ──────────────────────────────────────

  Future<Map<String, dynamic>> getRecommendation(String diseaseKey, {String language = 'en', String provider = 'auto'}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/recommend'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'disease_key': diseaseKey,
        'language': language,
        'provider': provider,
      }),
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) throw Exception('Failed to get recommendation');
    return jsonDecode(res.body);
  }

  // ─── History ─────────────────────────────────────────────

  Future<Map<String, dynamic>> getHistory({int limit = 20, int offset = 0, String? crop}) async {
    final headers = await _getAuthHeaders();
    final params = {'limit': '$limit', 'offset': '$offset'};
    if (crop != null) params['crop'] = crop;

    final uri = Uri.parse('$baseUrl/api/history').replace(queryParameters: params);
    final res = await http.get(uri, headers: headers).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) throw Exception('Failed to fetch history');
    return jsonDecode(res.body);
  }

  Future<Map<String, dynamic>> getDetection(String id) async {
    final headers = await _getAuthHeaders();
    final res = await http.get(
      Uri.parse('$baseUrl/api/history/$id'),
      headers: headers,
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) throw Exception('Detection not found');
    return jsonDecode(res.body);
  }

  String getDetectionImageUrl(String id) {
    return '$baseUrl/api/history/$id/image';
  }

  // ─── Re-analyze (Vision AI) ──────────────────────────────

  Future<Map<String, dynamic>> reanalyzeDetection(String detectionId) async {
    final headers = await _getAuthHeaders();
    final res = await http.post(
      Uri.parse('$baseUrl/api/history/$detectionId/reanalyze'),
      headers: headers,
    ).timeout(const Duration(seconds: 60));

    if (res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['detail'] ?? 'Re-analysis failed');
    }
    return jsonDecode(res.body);
  }

  // ─── Authentication ──────────────────────────────────────

  Future<Map<String, dynamic>> registerUser(Map<String, String> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['detail'] ?? 'Registration failed');
    }
    return jsonDecode(res.body);
  }

  Future<Map<String, dynamic>> loginUser(Map<String, String> data) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['detail'] ?? 'Login failed');
    }
    return jsonDecode(res.body);
  }

  Future<UserProfile> getProfile() async {
    final headers = await _getAuthHeaders();
    final res = await http.get(
      Uri.parse('$baseUrl/api/auth/me'),
      headers: headers,
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) throw Exception('Failed to fetch profile');
    return UserProfile.fromJson(jsonDecode(res.body));
  }

  // ─── Weather ─────────────────────────────────────────────

  Future<Map<String, dynamic>> getWeather(double lat, double lon) async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/weather?lat=$lat&lon=$lon'),
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) throw Exception('Failed to fetch weather');
    return jsonDecode(res.body);
  }

  Future<Map<String, dynamic>> getDiseaseRisk(double lat, double lon, String disease) async {
    final params = {'lat': '$lat', 'lon': '$lon', 'disease': disease};
    final uri = Uri.parse('$baseUrl/api/weather/risk').replace(queryParameters: params);
    final res = await http.get(uri).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) throw Exception('Failed to fetch weather risk');
    return jsonDecode(res.body);
  }

  // ─── Diseases Search ─────────────────────────────────────

  Future<List<dynamic>> searchDiseases(String query) async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/diseases?search=$query'),
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) throw Exception('Failed to search diseases');
    final data = jsonDecode(res.body);
    return data['diseases'] ?? [];
  }

  // ─── Chat ────────────────────────────────────────────────

  Future<Map<String, dynamic>> resultChat(String detectionId, String question, {String language = 'en'}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/chat/results'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'detection_id': detectionId,
        'question': question,
        'language': language,
      }),
    ).timeout(const Duration(seconds: 60));

    if (res.statusCode != 200) throw Exception('Chat failed');
    return jsonDecode(res.body);
  }

  Future<List<dynamic>> getResultChatHistory(String detectionId) async {
    final res = await http.get(
      Uri.parse('$baseUrl/api/chat/results/$detectionId'),
    ).timeout(ApiConfig.timeout);

    if (res.statusCode != 200) return [];
    final data = jsonDecode(res.body);
    return data['messages'] ?? [];
  }
}
