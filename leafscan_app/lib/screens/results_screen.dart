import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/glass_card.dart';
import '../widgets/leaf_loader.dart';
import 'scan_screen.dart';

class ResultsScreen extends StatefulWidget {
  final String detectionId;
  const ResultsScreen({super.key, required this.detectionId});
  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  final _api = ApiService();
  final _tts = FlutterTts();
  Map<String, dynamic>? _data;
  bool _loading = true;
  bool _speaking = false;
  String? _visionAnalysis;
  bool _visionLoading = false;
  final List<Map<String, String>> _chatMessages = [];
  final _chatController = TextEditingController();
  bool _chatLoading = false;

  @override
  void initState() {
    super.initState();
    _loadData();
    _tts.setCompletionHandler(() => setState(() => _speaking = false));
  }

  Future<void> _loadData() async {
    try {
      final data = await _api.getDetection(widget.detectionId);
      setState(() { _data = data; _loading = false; if (data['vision_analysis'] != null) _visionAnalysis = data['vision_analysis']; });
      _loadChatHistory();
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadChatHistory() async {
    try {
      final msgs = await _api.getResultChatHistory(widget.detectionId);
      for (var m in msgs) {
        _chatMessages.add({'role': 'user', 'text': m['question'] ?? ''});
        _chatMessages.add({'role': 'ai', 'text': m['answer'] ?? ''});
      }
      setState(() {});
    } catch (_) {}
  }

  Future<void> _speak(String text) async {
    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.45);
    setState(() => _speaking = true);
    await _tts.speak(text);
  }

  Future<void> _visionCheck() async {
    setState(() => _visionLoading = true);
    try {
      final res = await _api.reanalyzeDetection(widget.detectionId);
      setState(() { _visionAnalysis = res['analysis']; _visionLoading = false; });
    } catch (e) {
      setState(() => _visionLoading = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Vision AI failed: $e'), backgroundColor: Colors.red));
    }
  }

  Future<void> _sendChat() async {
    final q = _chatController.text.trim();
    if (q.isEmpty) return;
    _chatController.clear();
    setState(() { _chatMessages.add({'role': 'user', 'text': q}); _chatLoading = true; });
    try {
      final res = await _api.resultChat(widget.detectionId, q);
      setState(() { _chatMessages.add({'role': 'ai', 'text': res['answer'] ?? 'No response'}); _chatLoading = false; });
    } catch (_) {
      setState(() { _chatMessages.add({'role': 'ai', 'text': 'Sorry, I couldn\'t process your question.'}); _chatLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(backgroundColor: AppColors.bgWarm, body: const Center(child: LeafLoader(message: 'Retrieving Report...')));
    if (_data == null) return Scaffold(backgroundColor: AppColors.bgWarm, body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(Icons.warning_rounded, size: 64, color: Colors.red), const SizedBox(height: 16), const Text('Report Not Found', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)), const SizedBox(height: 24), ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Go Back'))])));

    final disease = (_data!['disease_name'] ?? 'Unknown').toString().replaceAll('___', ' — ').replaceAll('_', ' ');
    final isHealthy = disease.toLowerCase().contains('healthy');
    final confidence = (_data!['confidence'] ?? 0).toDouble();
    final severity = _data!['severity'] ?? 'LOW';
    final imageUrl = _data!['image_filename'] != null ? _api.getDetectionImageUrl(_data!['id'] ?? widget.detectionId) : null;
    final rec = _data!['recommendation'] as Map<String, dynamic>?;
    final treatmentData = rec?['treatment_data'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: AppColors.bgWarm,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Nav
            Row(children: [
              GestureDetector(onTap: () => Navigator.pop(context), child: Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)]), child: const Icon(Icons.arrow_back_rounded, size: 20))),
              const Spacer(),
              const Text('Report', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const Spacer(), const SizedBox(width: 40),
            ]),
            const SizedBox(height: 20),

            // Image + Status
            if (imageUrl != null) ClipRRect(borderRadius: BorderRadius.circular(24), child: AspectRatio(aspectRatio: 1, child: Stack(fit: StackFit.expand, children: [CachedNetworkImage(imageUrl: imageUrl, fit: BoxFit.cover, placeholder: (_, __) => Container(color: AppColors.green100, child: const Center(child: CircularProgressIndicator())), errorWidget: (_, __, ___) => Container(color: AppColors.green100, child: const Icon(Icons.image_not_supported, size: 48))), Positioned(top: 16, left: 16, child: Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), decoration: BoxDecoration(color: isHealthy ? Colors.green : Colors.red, borderRadius: BorderRadius.circular(20)), child: Text(isHealthy ? '✓ HEALTHY' : '⚡ PATHOGEN', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13))))]))),
            const SizedBox(height: 20),

            // Disease name
            Text((_data!['crop_type'] ?? 'Crop').toString().toUpperCase() + ' ANALYSIS', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 2)),
            const SizedBox(height: 4),
            Text(disease, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, height: 1.2)),
            const SizedBox(height: 16),

            // Confidence + Severity
            Row(children: [
              Expanded(child: GlassCard(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('AI CONFIDENCE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 1.5)), const SizedBox(height: 4), Text('${confidence.toStringAsFixed(1)}%', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.primary)), const SizedBox(height: 6), LinearProgressIndicator(value: confidence / 100, backgroundColor: AppColors.green100, valueColor: const AlwaysStoppedAnimation(AppColors.primaryLight), minHeight: 6, borderRadius: BorderRadius.circular(3))]))),
              const SizedBox(width: 12),
              Expanded(child: GlassCard(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('SEVERITY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 1.5)), const SizedBox(height: 4), Text(severity, style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: severity == 'HIGH' ? Colors.red : severity == 'MEDIUM' ? Colors.orange : AppColors.primary)), const SizedBox(height: 6), Row(children: List.generate(3, (i) => Expanded(child: Container(height: 6, margin: EdgeInsets.only(right: i < 2 ? 4 : 0), decoration: BoxDecoration(color: i == 0 ? Colors.red : (severity != 'LOW' && i == 1 ? Colors.red : (severity == 'HIGH' && i == 2 ? Colors.red : AppColors.green100)), borderRadius: BorderRadius.circular(3))))))]))),
            ]),
            const SizedBox(height: 16),

            // Listen button
            SizedBox(width: double.infinity, child: OutlinedButton.icon(onPressed: () => _speak('$disease detected. Severity is $severity. Confidence ${confidence.toStringAsFixed(0)} percent.'), icon: Icon(_speaking ? Icons.stop_rounded : Icons.volume_up_rounded), label: Text(_speaking ? 'SPEAKING...' : 'LISTEN TO REPORT', style: const TextStyle(fontWeight: FontWeight.w800, letterSpacing: 1)), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), side: BorderSide(color: AppColors.green200), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))))),
            const SizedBox(height: 24),

            // Vision AI
            if (_visionAnalysis == null) GestureDetector(onTap: _visionLoading ? null : _visionCheck, child: Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(gradient: const LinearGradient(colors: [AppColors.earth, AppColors.primaryDark]), borderRadius: BorderRadius.circular(24), border: Border.all(color: AppColors.gold.withValues(alpha: 0.3))), child: Row(children: [Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Advanced AI Check', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.green300)), const SizedBox(height: 4), Text('Get a second opinion from Vision AI', style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.6)))])), _visionLoading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.visibility_rounded, color: Colors.white, size: 22))]))),
            if (_visionAnalysis != null) Container(padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: AppColors.primaryDark, borderRadius: BorderRadius.circular(24)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(children: [const Text('✨', style: TextStyle(fontSize: 20)), const SizedBox(width: 8), const Text('Expert Analysis Complete', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white))]), const SizedBox(height: 12), Text(_visionAnalysis!, style: TextStyle(fontSize: 15, color: AppColors.green100, height: 1.6))])),
            const SizedBox(height: 24),

            // Treatment
            Row(children: [Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.shield_rounded, color: Colors.white, size: 22)), const SizedBox(width: 12), const Text('Treatment Protocol', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900))]),
            const SizedBox(height: 16),
            // Organic
            GlassCard(padding: const EdgeInsets.all(20), border: Border(left: BorderSide(color: AppColors.primary, width: 6)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(children: [const Text('🍃', style: TextStyle(fontSize: 24)), const SizedBox(width: 10), const Text('Organic Solution', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800))]), const SizedBox(height: 12), Text(treatmentData?['organic'] ?? 'Standard organic fungicide (Neem Oil) application recommended.', style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6)), const SizedBox(height: 12), Row(children: [Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primaryLight)), const SizedBox(width: 8), Text('ENVIRONMENTALLY SAFE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primary, letterSpacing: 1))])])),
            const SizedBox(height: 12),
            // Chemical
            GlassCard(padding: const EdgeInsets.all(20), border: Border(left: BorderSide(color: AppColors.terracotta, width: 6)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(children: [const Text('🧪', style: TextStyle(fontSize: 24)), const SizedBox(width: 10), const Text('Chemical Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800))]), const SizedBox(height: 12), Text(treatmentData?['chemical'] ?? 'Consult local agricultural extension for specific spray schedules.', style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6)), const SizedBox(height: 12), Row(children: [Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red)), const SizedBox(width: 8), Text('FAST ACTING / HIGH EFFICACY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.terracotta, letterSpacing: 1))])])),
            const SizedBox(height: 16),
            // Prevention
            GlassCard(padding: const EdgeInsets.all(20), border: Border.all(color: AppColors.green200, width: 2), child: Row(children: [Container(width: 56, height: 56, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)]), child: const Center(child: Text('🛡️', style: TextStyle(fontSize: 28)))), const SizedBox(width: 16), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Prevention', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)), const SizedBox(height: 4), Text(treatmentData?['prevention'] ?? 'Implement crop rotation and ensure proper spacing.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5))]))])),
            const SizedBox(height: 24),

            // Chat
            Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: AppColors.green200), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 16)]), child: Column(children: [
              Padding(padding: const EdgeInsets.all(16), child: Row(children: [Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.chat_rounded, color: Colors.white, size: 20)), const SizedBox(width: 12), const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Ask About This Disease', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)), Text('Get expert AI advice', style: TextStyle(fontSize: 12, color: AppColors.textMuted))]))])),
              Container(height: 1, color: AppColors.green100),
              Container(constraints: const BoxConstraints(maxHeight: 300), child: ListView.builder(shrinkWrap: true, padding: const EdgeInsets.all(16), itemCount: _chatMessages.length + (_chatLoading ? 1 : 0), itemBuilder: (_, i) {
                if (i >= _chatMessages.length) return Row(children: [Container(width: 32, height: 32, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 18)), const SizedBox(width: 8), Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: AppColors.green50, borderRadius: BorderRadius.circular(16)), child: const SizedBox(width: 40, height: 16, child: Center(child: Text('...'))))]);
                final msg = _chatMessages[i];
                final isUser = msg['role'] == 'user';
                return Padding(padding: const EdgeInsets.only(bottom: 8), child: Row(mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start, crossAxisAlignment: CrossAxisAlignment.start, children: [
                  if (!isUser) Container(width: 32, height: 32, margin: const EdgeInsets.only(right: 8), decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 18)),
                  Flexible(child: Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: isUser ? AppColors.primary : AppColors.green50, borderRadius: BorderRadius.circular(18)), child: Text(msg['text'] ?? '', style: TextStyle(fontSize: 14, color: isUser ? Colors.white : AppColors.text, fontWeight: FontWeight.w500, height: 1.4)))),
                  if (isUser) Container(width: 32, height: 32, margin: const EdgeInsets.only(left: 8), decoration: BoxDecoration(color: AppColors.earth, borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.person_rounded, color: Colors.white, size: 18)),
                ]));
              })),
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border(top: BorderSide(color: AppColors.green100))), child: Row(children: [Expanded(child: TextField(controller: _chatController, onSubmitted: (_) => _sendChat(), decoration: InputDecoration(hintText: 'Ask a question...', border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: AppColors.green200)), contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14), filled: true, fillColor: Colors.white))), const SizedBox(width: 8), GestureDetector(onTap: _sendChat, child: Container(padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(16)), child: const Icon(Icons.send_rounded, color: Colors.white, size: 20)))])),
            ])),
            const SizedBox(height: 24),
            SizedBox(width: double.infinity, child: ElevatedButton.icon(onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ScanScreen())), icon: const Icon(Icons.camera_alt_rounded), label: const Text('Scan Another Plant'), style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))))),
            const SizedBox(height: 32),
          ]),
        ),
      ),
    );
  }
}
