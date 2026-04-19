import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary greens
  static const Color primary = Color(0xFF2d6a4f);
  static const Color primaryLight = Color(0xFF52b788);
  static const Color primaryDark = Color(0xFF1b4332);
  static const Color green50 = Color(0xFFf0fdf4);
  static const Color green100 = Color(0xFFdcfce7);
  static const Color green200 = Color(0xFFbbf7d0);
  static const Color green300 = Color(0xFF86efac);
  static const Color green400 = Color(0xFF4ade80);
  static const Color green900 = Color(0xFF14532d);
  static const Color green950 = Color(0xFF052e16);

  // Earth tones
  static const Color earth = Color(0xFF2c1810);
  static const Color cream = Color(0xFFF5F0E8);
  static const Color creamDark = Color(0xFFE8DFD0);
  static const Color bgWarm = Color(0xFFFAF8F5);

  // Gold accents
  static const Color gold = Color(0xFFd4a853);
  static const Color goldLight = Color(0xFFe8c97a);
  static const Color goldDark = Color(0xFFb8942e);

  // Terracotta
  static const Color terracotta = Color(0xFFc4653a);
  static const Color terracottaLight = Color(0xFFe8a882);

  // Text
  static const Color text = Color(0xFF1a2e1a);
  static const Color textSecondary = Color(0xFF4a6741);
  static const Color textMuted = Color(0xFF7a9470);

  // Severity
  static const Color severityHigh = Color(0xFFdc2626);
  static const Color severityMedium = Color(0xFFf59e0b);
  static const Color severityLow = Color(0xFF16a34a);
  static const Color severityNone = Color(0xFF22c55e);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.bgWarm,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.gold,
        surface: AppColors.cream,
        onPrimary: Colors.white,
        brightness: Brightness.light,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        headlineLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: AppColors.text,
          letterSpacing: -0.5,
        ),
        headlineMedium: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.w800,
          color: AppColors.text,
        ),
        headlineSmall: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.text,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.textSecondary,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: AppColors.text,
        ),
        iconTheme: const IconThemeData(color: AppColors.text),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
          elevation: 4,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: AppColors.green200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: AppColors.green200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
        hintStyle: GoogleFonts.inter(
          color: AppColors.textMuted,
          fontWeight: FontWeight.w500,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        shadowColor: AppColors.primary.withValues(alpha: 0.1),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 16,
      ),
    );
  }
}
