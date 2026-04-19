import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../screens/home_screen.dart';
import '../screens/scan_screen.dart';
import '../screens/history_screen.dart';
import '../screens/search_screen.dart';
import '../screens/weather_screen.dart';

class BottomNav extends StatefulWidget {
  final int currentIndex;
  
  const BottomNav({super.key, this.currentIndex = 0});

  @override
  State<BottomNav> createState() => _BottomNavState();
}

class _BottomNavState extends State<BottomNav> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.currentIndex;
  }

  void _onTap(int index) {
    if (index == _currentIndex) return;
    
    Widget screen;
    switch (index) {
      case 0:
        screen = const HomeScreen();
        break;
      case 1:
        screen = const ScanScreen();
        break;
      case 2:
        screen = const HistoryScreen();
        break;
      case 3:
        screen = const SearchScreen();
        break;
      case 4:
        screen = const WeatherScreen();
        break;
      default:
        screen = const HomeScreen();
    }

    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => screen,
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 200),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTap,
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
          elevation: 0,
          items: [
            BottomNavigationBarItem(
              icon: Icon(_currentIndex == 0 ? Icons.home_rounded : Icons.home_outlined),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _currentIndex == 1 ? AppColors.primary : AppColors.green100,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  Icons.camera_alt_rounded,
                  color: _currentIndex == 1 ? Colors.white : AppColors.primary,
                  size: 24,
                ),
              ),
              label: 'Scan',
            ),
            BottomNavigationBarItem(
              icon: Icon(_currentIndex == 2 ? Icons.history_rounded : Icons.history_outlined),
              label: 'History',
            ),
            BottomNavigationBarItem(
              icon: Icon(_currentIndex == 3 ? Icons.search_rounded : Icons.search_outlined),
              label: 'Search',
            ),
            BottomNavigationBarItem(
              icon: Icon(_currentIndex == 4 ? Icons.cloud_rounded : Icons.cloud_outlined),
              label: 'Weather',
            ),
          ],
        ),
      ),
    );
  }
}
