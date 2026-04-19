import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import 'home_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _api = ApiService();
  final _emailCtl = TextEditingController();
  final _passCtl = TextEditingController();
  bool _showPass = false;
  bool _loading = false;
  String? _error;

  Future<void> _login() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await _api.loginUser({'email': _emailCtl.text.trim(), 'password': _passCtl.text});
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
        decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF052e16), Color(0xFF14532d), Color(0xFF1b4332)])),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(children: [
              const SizedBox(height: 20),
              Row(children: [GestureDetector(onTap: () => Navigator.pop(context), child: Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withValues(alpha: 0.1))), child: const Text('← Back', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13))))]),
              const SizedBox(height: 40),
              Container(padding: const EdgeInsets.all(32), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(32), border: Border.all(color: Colors.white.withValues(alpha: 0.15))), child: Column(children: [
                Container(width: 64, height: 64, decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1), shape: BoxShape.circle, border: Border.all(color: Colors.white.withValues(alpha: 0.2))), child: const Icon(Icons.eco_rounded, color: AppColors.green300, size: 32)),
                const SizedBox(height: 20),
                const Text('Welcome Back', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 4),
                Text('Sign in to continue.', style: TextStyle(color: AppColors.green100, fontWeight: FontWeight.w500, fontSize: 14)),
                const SizedBox(height: 32),
                if (_error != null) Container(padding: const EdgeInsets.all(14), margin: const EdgeInsets.only(bottom: 20), decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red.withValues(alpha: 0.3))), child: Row(children: [const Icon(Icons.warning_rounded, color: Colors.red, size: 20), const SizedBox(width: 10), Expanded(child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600, fontSize: 13)))])),
                _field('Email or Phone', _emailCtl, false),
                const SizedBox(height: 16),
                _field('Password', _passCtl, true),
                const SizedBox(height: 24),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _loading ? null : _login, style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryLight, foregroundColor: AppColors.green950, padding: const EdgeInsets.symmetric(vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)), elevation: 8, shadowColor: AppColors.primaryLight.withValues(alpha: 0.3)), child: _loading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.green950)) : const Text('Log In', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)))),
                const SizedBox(height: 24),
                Row(children: [Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.2))), Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('OR', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 2))), Expanded(child: Divider(color: Colors.white.withValues(alpha: 0.2)))]),
                const SizedBox(height: 24),
                GestureDetector(onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())), child: RichText(text: TextSpan(style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.w500), children: [const TextSpan(text: 'New here? '), TextSpan(text: 'Create an account', style: TextStyle(color: AppColors.green300, fontWeight: FontWeight.w700))]))),
              ])),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController ctl, bool isPassword) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label.toUpperCase(), style: TextStyle(color: AppColors.green200, fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 2)),
      const SizedBox(height: 6),
      TextField(controller: ctl, obscureText: isPassword && !_showPass, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500), decoration: InputDecoration(
        filled: true, fillColor: Colors.white.withValues(alpha: 0.1),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.2))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: AppColors.green300, width: 2)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
        hintText: isPassword ? '••••••••' : 'farmer@example.com',
        hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
        suffixIcon: isPassword ? IconButton(icon: Icon(_showPass ? Icons.visibility : Icons.visibility_off, color: Colors.white.withValues(alpha: 0.5)), onPressed: () => setState(() => _showPass = !_showPass)) : null,
      )),
    ]);
  }
}
