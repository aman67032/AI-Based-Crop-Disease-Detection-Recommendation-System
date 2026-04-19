import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import 'home_screen.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _api = ApiService();
  final _nameCtl = TextEditingController();
  final _emailCtl = TextEditingController();
  final _phoneCtl = TextEditingController();
  final _passCtl = TextEditingController();
  String _lang = 'en';
  bool _loading = false;
  String? _error;

  Future<void> _register() async {
    if (_emailCtl.text.isEmpty && _phoneCtl.text.isEmpty) { setState(() => _error = 'Please provide email or phone'); return; }
    setState(() { _loading = true; _error = null; });
    try {
      final res = await _api.registerUser({'name': _nameCtl.text.trim(), 'email': _emailCtl.text.trim(), 'phone': _phoneCtl.text.trim(), 'password': _passCtl.text, 'language_pref': _lang});
      if (res['token'] != null) {
        await _api.setToken(res['token']);
        if (mounted) Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const HomeScreen()), (_) => false);
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topRight, end: Alignment.bottomLeft, colors: [Color(0xFF052e16), Color(0xFF14532d), Color(0xFF0d2818)])),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(children: [
              Row(children: [GestureDetector(onTap: () => Navigator.pop(context), child: Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withValues(alpha: 0.1))), child: const Text('← Back', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13))))]),
              const SizedBox(height: 24),
              Container(padding: const EdgeInsets.all(28), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(32), border: Border.all(color: Colors.white.withValues(alpha: 0.15))), child: Column(children: [
                Container(width: 64, height: 64, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), shape: BoxShape.circle, border: Border.all(color: Colors.white.withValues(alpha: 0.2))), child: const Icon(Icons.layers_rounded, color: AppColors.green300, size: 32)),
                const SizedBox(height: 16),
                const Text('Create Account', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 4),
                Text('Join the LeafScan community.', style: TextStyle(color: AppColors.green100, fontWeight: FontWeight.w500)),
                const SizedBox(height: 24),
                if (_error != null) Container(padding: const EdgeInsets.all(14), margin: const EdgeInsets.only(bottom: 16), decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red.withValues(alpha: 0.3))), child: Row(children: [const Icon(Icons.warning_rounded, color: Colors.red, size: 20), const SizedBox(width: 10), Expanded(child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600, fontSize: 13)))])),
                _field('Full Name', _nameCtl, 'Ramesh Kumar'),
                const SizedBox(height: 14),
                _field('Email', _emailCtl, 'farmer@example.com'),
                const SizedBox(height: 14),
                _field('Phone Number', _phoneCtl, '+91 98765 43210'),
                const SizedBox(height: 14),
                _field('Password', _passCtl, '••••••••', isPassword: true),
                const SizedBox(height: 14),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('LANGUAGE', style: TextStyle(color: AppColors.green200, fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 2)),
                  const SizedBox(height: 6),
                  Container(padding: const EdgeInsets.symmetric(horizontal: 20), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withValues(alpha: 0.2))), child: DropdownButtonHideUnderline(child: DropdownButton<String>(value: _lang, isExpanded: true, dropdownColor: AppColors.earth, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500, fontSize: 16), items: const [DropdownMenuItem(value: 'en', child: Text('English')), DropdownMenuItem(value: 'hi', child: Text('हिन्दी'))], onChanged: (v) => setState(() => _lang = v!)))),
                ]),
                const SizedBox(height: 24),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _loading ? null : _register, style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryLight, foregroundColor: AppColors.green950, padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))), child: _loading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.green950)) : const Text('Create Free Account', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800)))),
                const SizedBox(height: 20),
                GestureDetector(onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())), child: RichText(text: TextSpan(style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.w500), children: [const TextSpan(text: 'Already using LeafScan? '), TextSpan(text: 'Sign in', style: TextStyle(color: AppColors.green300, fontWeight: FontWeight.w700))]))),
              ])),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController ctl, String hint, {bool isPassword = false}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label.toUpperCase(), style: TextStyle(color: AppColors.green200, fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 2)),
      const SizedBox(height: 6),
      TextField(controller: ctl, obscureText: isPassword, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500), decoration: InputDecoration(filled: true, fillColor: Colors.white.withValues(alpha: 0.1), border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2))), enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2))), focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: AppColors.green300, width: 2)), contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18), hintText: hint, hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)))),
    ]);
  }
}
