import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/leaf_loader.dart';
import 'results_screen.dart';
import 'history_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});
  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  File? _imageFile;
  bool _isLoading = false;
  final _picker = ImagePicker();
  final _api = ApiService();

  Future<void> _pickImage(ImageSource source) async {
    try {
      final xFile = await _picker.pickImage(source: source, maxWidth: 1920, maxHeight: 1920, imageQuality: 90);
      if (xFile != null) setState(() => _imageFile = File(xFile.path));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'), backgroundColor: Colors.red));
    }
  }

  Future<void> _analyzePlant() async {
    if (_imageFile == null) return;
    setState(() => _isLoading = true);
    try {
      final res = await _api.detectDisease(_imageFile!);
      if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => ResultsScreen(detectionId: res.id)));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Analysis failed: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFF2c1810), Color(0xFF1b4332), Color(0xFF2c1810)])),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(children: [
              Row(children: [
                GestureDetector(onTap: () => Navigator.pop(context), child: Container(width: 44, height: 44, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withValues(alpha: 0.2))), child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 22))),
                const Spacer(),
                Row(children: [Icon(Icons.camera_alt_rounded, color: AppColors.goldLight, size: 24), const SizedBox(width: 8), const Text('Scan Plant', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white))]),
                const Spacer(), const SizedBox(width: 44),
              ]),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(32), border: Border.all(color: Colors.white.withValues(alpha: 0.15))),
                child: _isLoading ? _buildLoading() : _imageFile != null ? _buildPreview() : _buildUpload(),
              ),
              const SizedBox(height: 24),
              _tip('☀️', 'Good Light', 'Use bright, indirect sunlight.'),
              const SizedBox(height: 12),
              _tip('🍃', 'Full Leaf', 'Make sure the leaf fills the frame.'),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _buildLoading() => Padding(padding: const EdgeInsets.symmetric(vertical: 48), child: Column(children: [const LeafLoader(size: 96), const SizedBox(height: 24), const Text('Analyzing Leaf...', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)), const SizedBox(height: 8), Text('पत्ती की जाँच हो रही है...', style: TextStyle(fontSize: 15, color: Colors.white.withValues(alpha: 0.6)))]));

  Widget _buildPreview() => Column(children: [
    ClipRRect(borderRadius: BorderRadius.circular(20), child: AspectRatio(aspectRatio: 4/3, child: Stack(fit: StackFit.expand, children: [Image.file(_imageFile!, fit: BoxFit.cover), Positioned(top: 12, right: 12, child: GestureDetector(onTap: () => setState(() => _imageFile = null), child: Container(width: 44, height: 44, decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.8), borderRadius: BorderRadius.circular(14)), child: const Icon(Icons.close_rounded, color: Colors.white, size: 24))))]))),
    const SizedBox(height: 20),
    SizedBox(width: double.infinity, child: ElevatedButton.icon(onPressed: _analyzePlant, icon: const Icon(Icons.bolt_rounded, size: 24), label: const Text('Analyze Plant', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)), style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold, foregroundColor: AppColors.earth, padding: const EdgeInsets.symmetric(vertical: 20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))))),
  ]);

  Widget _buildUpload() => Column(children: [
    Container(padding: const EdgeInsets.all(32), decoration: BoxDecoration(border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 2), borderRadius: BorderRadius.circular(24)), child: Column(children: [Container(width: 80, height: 80, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(24)), child: Icon(Icons.cloud_upload_rounded, color: AppColors.goldLight, size: 40)), const SizedBox(height: 16), const Text('Upload or Take Photo', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)), const SizedBox(height: 4), Text('JPG, PNG (Max 5MB)', style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.5)))])),
    const SizedBox(height: 20),
    SizedBox(width: double.infinity, child: ElevatedButton.icon(onPressed: () => _pickImage(ImageSource.camera), icon: const Icon(Icons.camera_alt_rounded), label: const Text('📷 Take Photo', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)), style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))))),
    const SizedBox(height: 12),
    SizedBox(width: double.infinity, child: ElevatedButton.icon(onPressed: () => _pickImage(ImageSource.gallery), icon: const Icon(Icons.photo_library_rounded), label: const Text('🖼️ Gallery', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)), style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold, foregroundColor: AppColors.earth, padding: const EdgeInsets.symmetric(vertical: 20), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))))),
  ]);

  Widget _tip(String emoji, String title, String desc) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withValues(alpha: 0.1))), child: Row(children: [Container(width: 48, height: 48, decoration: BoxDecoration(color: AppColors.gold.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(14)), child: Center(child: Text(emoji, style: const TextStyle(fontSize: 22)))), const SizedBox(width: 14), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)), Text(desc, style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.6)))]))]));
}
