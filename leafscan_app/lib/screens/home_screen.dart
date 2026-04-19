import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../widgets/bottom_nav.dart';
import '../widgets/glass_card.dart';
import '../widgets/leaf_loader.dart';
import 'results_screen.dart';
import 'scan_screen.dart';
import 'login_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isAuth = false;
  final _api = ApiService();

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await _api.getToken();
    setState(() => _isAuth = token != null && token.isNotEmpty);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeroSection(context),
            _buildHowItWorks(context),
            _buildAboutSection(context),
            _buildScanCTA(context),
            _buildFooter(context),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNav(currentIndex: 0),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF1a3a2a), Color(0xFF2d6a4f), Color(0xFF1b4332)],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 40),
          child: Column(
            children: [
              // Top bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.eco_rounded, color: AppColors.green300, size: 24),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'LeafScan',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => _isAuth ? const ProfileScreen() : const LoginScreen(),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _isAuth ? Icons.person_rounded : Icons.login_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _isAuth ? 'Profile' : 'Login',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.eco, color: AppColors.goldLight, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'AI-POWERED CROP CARE',
                      style: TextStyle(
                        color: AppColors.goldLight,
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                        letterSpacing: 2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Title
              const Text(
                'Protect Your Crops,',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  height: 1.1,
                ),
                textAlign: TextAlign.center,
              ),
              Text(
                'Grow With Confidence',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: AppColors.goldLight,
                  height: 1.1,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Detect plant diseases instantly using AI.\nExpert treatment plans at your fingertips.',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withValues(alpha: 0.85),
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              // CTA Buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScanScreen())),
                      icon: const Icon(Icons.camera_alt_rounded, size: 22),
                      label: const Text('Scan Plant', style: TextStyle(fontWeight: FontWeight.w800)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryLight,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        elevation: 8,
                        shadowColor: AppColors.primaryLight.withValues(alpha: 0.4),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHowItWorks(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      color: AppColors.bgWarm,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.green100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'SIMPLE & EASY',
              style: TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w800,
                fontSize: 11,
                letterSpacing: 2,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'How LeafScan Works',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.text),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'Three simple steps to healthier plants.',
            style: TextStyle(fontSize: 15, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 32),
          _buildStepCard(Icons.camera_alt_rounded, 'Take a Photo', 'Click a clear photo of the affected leaf using your camera.', AppColors.green100, AppColors.primary),
          const SizedBox(height: 16),
          _buildStepCard(Icons.lightbulb_rounded, 'AI Analysis', 'Our AI instantly identifies the disease and severity.', AppColors.goldLight.withValues(alpha: 0.3), AppColors.goldDark),
          const SizedBox(height: 16),
          _buildStepCard(Icons.shield_rounded, 'Get Treatment', 'Receive organic and chemical treatment plans.', AppColors.terracottaLight.withValues(alpha: 0.3), AppColors.terracotta),
        ],
      ),
    );
  }

  Widget _buildStepCard(IconData icon, String title, String desc, Color bgColor, Color iconColor) {
    return GlassCard(
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(icon, color: iconColor, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.text)),
                const SizedBox(height: 4),
                Text(desc, style: TextStyle(fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAboutSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      color: AppColors.cream,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.green100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'ABOUT LEAFSCAN',
              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 11, letterSpacing: 2),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Empowering Farmers\nwith AI',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.text, height: 1.2),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'LeafScan bridges AI and farming with accurate plant disease detection and sustainable treatments.',
            style: TextStyle(fontSize: 15, color: AppColors.textSecondary, fontWeight: FontWeight.w500, height: 1.6),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ...[
            '98% Accuracy Models',
            'Expert Verified Treatments',
            'Community of Farmers',
          ].map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.green100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.check_rounded, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 12),
                Text(item, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.text)),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildScanCTA(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppColors.bgWarm, AppColors.green50],
        ),
      ),
      child: Column(
        children: [
          Text(
            'Analyze Your Plant',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.text),
          ),
          const SizedBox(height: 8),
          Text(
            'Upload or take a photo for instant AI diagnosis.',
            style: TextStyle(fontSize: 15, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          GlassCard(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.green100,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Icon(Icons.cloud_upload_rounded, color: AppColors.primary, size: 36),
                ),
                const SizedBox(height: 16),
                Text('Take or Upload a Photo', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.text)),
                const SizedBox(height: 4),
                Text('JPG, PNG (Max 5MB)', style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ScanScreen())),
                    icon: const Icon(Icons.camera_alt_rounded),
                    label: const Text('Open Scanner'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      decoration: BoxDecoration(
        color: AppColors.earth,
        border: Border(top: BorderSide(color: AppColors.gold, width: 4)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.eco_rounded, color: AppColors.green300, size: 28),
              const SizedBox(width: 10),
              const Text('LeafScan', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'AI-powered plant care. Empowering farmers with accurate disease detection and sustainable treatments.',
            style: TextStyle(color: AppColors.terracottaLight, fontWeight: FontWeight.w500, fontSize: 14, height: 1.5),
          ),
          const SizedBox(height: 24),
          Divider(color: Colors.white.withValues(alpha: 0.1)),
          const SizedBox(height: 12),
          Text(
            '© 2026 LeafScan. All rights reserved.',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
