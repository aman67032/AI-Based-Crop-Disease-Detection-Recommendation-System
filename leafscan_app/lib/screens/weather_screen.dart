import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/bottom_nav.dart';
import '../widgets/glass_card.dart';

class WeatherScreen extends StatefulWidget {
  const WeatherScreen({super.key});
  @override
  State<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  final _api = ApiService();
  bool _loading = true;
  Map<String, dynamic>? _weather;

  @override
  void initState() {
    super.initState();
    _fetchWeather();
  }

  Future<void> _fetchWeather() async {
    double lat = 28.6139, lon = 77.2090; // Default: Delhi
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) await Geolocator.requestPermission();
      final pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.low).timeout(const Duration(seconds: 10));
      lat = pos.latitude; lon = pos.longitude;
    } catch (_) {}
    try {
      final data = await _api.getWeather(lat, lon);
      if (data['current'] != null) {
        setState(() {
          _weather = {
            'temp': data['current']['temp'],
            'humidity': data['current']['humidity'],
            'rain': data['forecast']?[0]?['pop'] != null ? (data['forecast'][0]['pop'] * 100).round() : 0,
            'condition': data['current']['description'] ?? 'Partly Cloudy',
            'waterSuggestion': (data['current']['humidity'] ?? 0) > 70 ? 'every 2 days' : '1 time per day',
          };
          _loading = false;
        });
      } else { setState(() => _loading = false); }
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgWarm,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6), decoration: BoxDecoration(color: AppColors.green100, borderRadius: BorderRadius.circular(20)), child: Text('☀️ LIVE WEATHER', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 2))),
            const SizedBox(height: 8),
            const Text('Smart Weather Insights', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text('Real-time weather for your farming needs.', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
            const SizedBox(height: 32),
            if (_loading) ...[
              const SizedBox(height: 60),
              const Center(child: CircularProgressIndicator()),
              const SizedBox(height: 16),
              Text('Fetching weather...', style: TextStyle(color: AppColors.textMuted)),
            ] else if (_weather != null) ...[
              Row(children: [
                Expanded(child: _weatherCard('☀️', 'Temperature', '${_weather!['temp']}°C', _weather!['condition'] ?? '', AppColors.goldLight.withValues(alpha: 0.4), AppColors.goldDark)),
                const SizedBox(width: 12),
                Expanded(child: _weatherCard('💧', 'Humidity', '${_weather!['humidity']}%', 'Optimal range', AppColors.green100, AppColors.primary)),
              ]),
              const SizedBox(height: 12),
              _weatherCard('🌧️', 'Rain Probability', '${_weather!['rain']}%', 'Chance of rain', AppColors.terracottaLight.withValues(alpha: 0.3), AppColors.terracotta),
              const SizedBox(height: 24),
              Container(padding: const EdgeInsets.all(28), decoration: BoxDecoration(gradient: const LinearGradient(colors: [AppColors.earth, AppColors.primaryDark]), borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 16, offset: const Offset(0, 8))]), child: Column(children: [
                Container(width: 56, height: 56, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), shape: BoxShape.circle), child: const Center(child: Text('🌱', style: TextStyle(fontSize: 28)))),
                const SizedBox(height: 16),
                const Text('Smart Watering Suggestion', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 8),
                RichText(textAlign: TextAlign.center, text: TextSpan(style: TextStyle(fontSize: 15, color: AppColors.green100, fontWeight: FontWeight.w500, height: 1.5), children: [
                  const TextSpan(text: 'Based on today\'s weather, we recommend watering '),
                  TextSpan(text: _weather!['waterSuggestion'], style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, backgroundColor: Colors.white12)),
                  const TextSpan(text: ' to maintain optimal soil moisture.'),
                ])),
              ])),
            ] else ...[
              const SizedBox(height: 60),
              Icon(Icons.cloud_off_rounded, size: 64, color: AppColors.textMuted),
              const SizedBox(height: 16),
              const Text('Weather data unavailable', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              Text('Check your connection and try again.', style: TextStyle(color: AppColors.textMuted)),
            ],
          ]),
        ),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 4),
    );
  }

  Widget _weatherCard(String emoji, String label, String value, String subtitle, Color bgColor, Color iconColor) {
    return GlassCard(padding: const EdgeInsets.all(20), child: Column(children: [
      Container(width: 52, height: 52, decoration: BoxDecoration(color: bgColor, shape: BoxShape.circle), child: Center(child: Text(emoji, style: const TextStyle(fontSize: 24)))),
      const SizedBox(height: 12),
      Text(label.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 1.5)),
      const SizedBox(height: 4),
      Text(value, style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: AppColors.text)),
      Text(subtitle, style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
    ]));
  }
}
