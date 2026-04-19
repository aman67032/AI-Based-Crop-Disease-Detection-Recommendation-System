import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/glass_card.dart';
import '../widgets/leaf_loader.dart';
import 'login_screen.dart';
import 'scan_screen.dart';
import 'results_screen.dart';
import 'home_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _profile;
  List<dynamic> _history = [];
  bool _loading = true;
  String _tab = 'scans';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await _api.getProfile();
      final hist = await _api.getHistory(limit: 10);
      setState(() { _profile = {'name': profile.name, 'email': profile.email, 'phone': profile.phone, 'created_at': profile.createdAt}; _history = hist['detections'] ?? []; _loading = false; });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _logout() async {
    await _api.removeToken();
    if (mounted) Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomeScreen()), (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(backgroundColor: AppColors.bgWarm, body: const Center(child: LeafLoader(message: 'Loading Profile...')));
    if (_profile == null) return Scaffold(backgroundColor: AppColors.bgWarm, body: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [const Icon(Icons.warning_rounded, size: 64, color: Colors.red), const SizedBox(height: 16), const Text('Session Expired', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)), const SizedBox(height: 24), ElevatedButton(onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())), child: const Text('Log In'))])));

    final totalScans = _history.length;
    final healthy = _history.where((d) => (d['disease_name'] ?? '').toString().toLowerCase().contains('healthy')).length;
    final memberSince = _profile!['created_at'] != null ? (() { try { final d = DateTime.parse(_profile!['created_at']); return '${d.day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.month-1]} ${d.year}'; } catch (_) { return 'N/A'; } })() : 'N/A';

    return Scaffold(
      backgroundColor: AppColors.bgWarm,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(children: [
            Row(children: [
              GestureDetector(onTap: () => Navigator.pop(context), child: Container(width: 40, height: 40, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)]), child: const Icon(Icons.arrow_back_rounded, size: 20))),
              const Spacer(),
              const Text('👤 My Profile', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
              const Spacer(), const SizedBox(width: 40),
            ]),
            const SizedBox(height: 20),
            // Profile card
            Container(padding: const EdgeInsets.all(24), decoration: BoxDecoration(gradient: const LinearGradient(colors: [AppColors.earth, AppColors.primaryDark]), borderRadius: BorderRadius.circular(24), border: Border.all(color: AppColors.gold.withValues(alpha: 0.3))), child: Column(children: [
              Row(children: [
                Container(width: 72, height: 72, decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(24), border: Border.all(color: AppColors.primary.withValues(alpha: 0.4), width: 3)), child: const Center(child: Text('🧑‍🌾', style: TextStyle(fontSize: 36)))),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(_profile!['name'] ?? 'User', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                  if (_profile!['email'] != null) Text(_profile!['email'], style: TextStyle(color: AppColors.green300, fontSize: 13, fontWeight: FontWeight.w600)),
                  Text('Member since $memberSince', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 12)),
                ])),
              ]),
              const SizedBox(height: 20),
              Row(children: [
                _stat('$totalScans', 'Scans'),
                _stat('$healthy', 'Healthy'),
                _stat('${totalScans - healthy}', 'Diseases'),
              ]),
            ])),
            const SizedBox(height: 16),
            // Logout button
            SizedBox(width: double.infinity, child: OutlinedButton.icon(onPressed: _logout, icon: const Icon(Icons.logout_rounded, color: Colors.red), label: const Text('Logout', style: TextStyle(color: Colors.red, fontWeight: FontWeight.w700)), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), side: const BorderSide(color: Colors.red), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))))),
            const SizedBox(height: 24),
            // Recent scans
            Row(children: [const Text('Recent Scans', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)), const Spacer()]),
            const SizedBox(height: 12),
            if (_history.isEmpty) GlassCard(padding: const EdgeInsets.all(32), child: Column(children: [const Text('🌱', style: TextStyle(fontSize: 40)), const SizedBox(height: 12), const Text('No scans yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)), const SizedBox(height: 12), ElevatedButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScanScreen())), child: const Text('Start First Scan'))]))
            else ..._history.map((item) {
              final disease = (item['disease_name'] ?? 'Unknown').toString().replaceAll('_', ' ');
              final isH = disease.toLowerCase().contains('healthy');
              return Padding(padding: const EdgeInsets.only(bottom: 8), child: GestureDetector(onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ResultsScreen(detectionId: item['id']))), child: GlassCard(padding: const EdgeInsets.all(16), border: Border(left: BorderSide(color: isH ? AppColors.primary : AppColors.terracotta, width: 4)), child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: isH ? AppColors.green100 : const Color(0xFFfee2e2), borderRadius: BorderRadius.circular(10)), child: Text(isH ? 'Healthy' : 'Disease', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: isH ? AppColors.primary : Colors.red)))]),
                  const SizedBox(height: 4),
                  Text(disease, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800), maxLines: 1, overflow: TextOverflow.ellipsis),
                  Text('${item['crop_type'] ?? ''} • ${(item['confidence'] ?? 0).toStringAsFixed(1)}%', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ])),
                Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
              ]))));
            }),
          ]),
        ),
      ),
    );
  }

  Widget _stat(String value, String label) {
    return Expanded(child: Container(margin: const EdgeInsets.symmetric(horizontal: 4), padding: const EdgeInsets.symmetric(vertical: 12), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withValues(alpha: 0.1))), child: Column(children: [Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)), Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.goldLight, letterSpacing: 1))])));
  }
}
