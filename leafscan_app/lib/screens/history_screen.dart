import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/bottom_nav.dart';
import '../widgets/glass_card.dart';
import 'results_screen.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});
  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final _api = ApiService();
  List<dynamic> _detections = [];
  bool _loading = true;
  String _filter = '';

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final data = await _api.getHistory(limit: 50);
      setState(() { _detections = data['detections'] ?? []; _loading = false; });
    } catch (_) {
      setState(() {
        _detections = [
          {'id': '1', 'crop_type': 'Tomato', 'disease_name': 'Early_Blight', 'confidence': 95.5, 'severity': 'HIGH', 'created_at': DateTime.now().toIso8601String()},
          {'id': '2', 'crop_type': 'Potato', 'disease_name': 'Healthy', 'confidence': 99.1, 'severity': 'NONE', 'created_at': DateTime.now().subtract(const Duration(days: 1)).toIso8601String()},
        ];
        _loading = false;
      });
    }
  }

  List<dynamic> get _filtered => _detections.where((d) {
    final q = _filter.toLowerCase();
    return (d['disease_name'] ?? '').toString().toLowerCase().contains(q) || (d['crop_type'] ?? '').toString().toLowerCase().contains(q);
  }).toList();

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try { final d = DateTime.parse(dateStr); return '${d.day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.month-1]} ${d.year}'; } catch (_) { return dateStr; }
  }

  Color _sevColor(String sev) => sev == 'HIGH' ? Colors.red : sev == 'MEDIUM' ? Colors.orange : AppColors.primaryLight;
  String _sevLabel(String sev) => sev == 'HIGH' ? 'Critical' : sev == 'MEDIUM' ? 'Warning' : sev == 'NONE' ? 'Healthy' : 'Stable';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgWarm,
      body: SafeArea(
        child: Column(children: [
          Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6), decoration: BoxDecoration(color: AppColors.green100, borderRadius: BorderRadius.circular(20)), child: Text('📊 RECORDS', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 2))),
            const SizedBox(height: 8),
            const Text('Scan History', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text('Keep track of your plant health.', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
            const SizedBox(height: 16),
            TextField(onChanged: (v) => setState(() => _filter = v), decoration: InputDecoration(hintText: 'Filter by crop or disease...', prefixIcon: const Icon(Icons.search_rounded), border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: AppColors.green200)), filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14))),
          ])),
          Expanded(child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _filtered.isEmpty
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.inbox_rounded, size: 64, color: AppColors.textMuted), const SizedBox(height: 16), Text('No scan records found.', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600))]))
              : ListView.builder(padding: const EdgeInsets.symmetric(horizontal: 20), itemCount: _filtered.length, itemBuilder: (_, i) {
                  final d = _filtered[i];
                  final sev = d['severity'] ?? 'NONE';
                  final disease = (d['disease_name'] ?? 'Unknown').toString().replaceAll('_', ' ');
                  return Padding(padding: const EdgeInsets.only(bottom: 12), child: GestureDetector(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ResultsScreen(detectionId: d['id']))),
                    child: GlassCard(padding: const EdgeInsets.all(16), child: Row(children: [
                      Container(width: 56, height: 56, decoration: BoxDecoration(color: AppColors.green100, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.green200)), child: Icon(Icons.image_rounded, color: AppColors.primary.withValues(alpha: 0.4), size: 28)),
                      const SizedBox(width: 14),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [Text(_formatDate(d['created_at']), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 1.5)), const Spacer(), Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: _sevColor(sev).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)), child: Text(_sevLabel(sev), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _sevColor(sev))))]),
                        const SizedBox(height: 4),
                        Text(disease, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800), maxLines: 1, overflow: TextOverflow.ellipsis),
                        Text('${d['crop_type'] ?? 'Unknown'} • ${(d['confidence'] ?? 0).toStringAsFixed(1)}%', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ])),
                      Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
                    ])),
                  ));
                }),
          ),
        ]),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 2),
    );
  }
}
