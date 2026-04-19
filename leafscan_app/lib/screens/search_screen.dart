import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/bottom_nav.dart';
import '../widgets/glass_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _api = ApiService();
  List<dynamic> _diseases = [];
  bool _loading = true;
  String _query = '';
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _search('');
  }

  void _onSearch(String q) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      setState(() => _query = q);
      _search(q);
    });
  }

  Future<void> _search(String q) async {
    setState(() => _loading = true);
    try {
      final diseases = await _api.searchDiseases(q);
      setState(() { _diseases = diseases; _loading = false; });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgWarm,
      body: SafeArea(
        child: Column(children: [
          Padding(padding: const EdgeInsets.all(20), child: Column(children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6), decoration: BoxDecoration(color: AppColors.green100, borderRadius: BorderRadius.circular(20)), child: Text('DISEASE LIBRARY', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 2))),
            const SizedBox(height: 8),
            const Text('Search Diseases', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text('Find information on crop diseases, symptoms, and treatments.', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            TextField(onChanged: _onSearch, decoration: InputDecoration(hintText: 'Search for a disease...', prefixIcon: const Icon(Icons.search_rounded), border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide(color: AppColors.green200)), filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18))),
          ])),
          Expanded(child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _diseases.isEmpty
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.sentiment_dissatisfied_rounded, size: 64, color: AppColors.textMuted), const SizedBox(height: 16), const Text('No diseases found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)), Text('Try adjusting your search.', style: TextStyle(color: AppColors.textMuted))]))
              : ListView.builder(padding: const EdgeInsets.symmetric(horizontal: 20), itemCount: _diseases.length, itemBuilder: (_, i) {
                  final d = _diseases[i];
                  return Padding(padding: const EdgeInsets.only(bottom: 16), child: GlassCard(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Container(width: 4, height: 40, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
                    Text(d['name'] ?? 'Unknown', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                    if (d['symptoms'] != null) ...[const SizedBox(height: 12), Text('SYMPTOMS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 1.5)), const SizedBox(height: 4), Text(d['symptoms'], style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5))],
                    if (d['treatment'] != null) ...[const SizedBox(height: 12), Text('TREATMENT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primary, letterSpacing: 1.5)), const SizedBox(height: 4), Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: AppColors.green50, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.green200)), child: Text(d['treatment'], style: TextStyle(fontSize: 14, color: AppColors.green900, fontWeight: FontWeight.w500)))],
                    if (d['prevention'] != null) ...[const SizedBox(height: 12), Text('PREVENTION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.terracotta, letterSpacing: 1.5)), const SizedBox(height: 4), Text(d['prevention'], style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5))],
                  ])));
                }),
          ),
        ]),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 3),
    );
  }
}
