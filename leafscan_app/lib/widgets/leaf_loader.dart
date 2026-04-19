import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class LeafLoader extends StatefulWidget {
  final String? message;
  final double size;

  const LeafLoader({super.key, this.message, this.size = 80});

  @override
  State<LeafLoader> createState() => _LeafLoaderState();
}

class _LeafLoaderState extends State<LeafLoader> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: widget.size,
          height: widget.size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Spinning ring
              RotationTransition(
                turns: _controller,
                child: Container(
                  width: widget.size,
                  height: widget.size,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.gold.withValues(alpha: 0.3),
                      width: 4,
                    ),
                  ),
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.gold,
                      ),
                    ),
                  ),
                ),
              ),
              // Leaf icon
              Icon(
                Icons.eco,
                size: widget.size * 0.45,
                color: AppColors.primaryLight,
              ),
            ],
          ),
        ),
        if (widget.message != null) ...[
          const SizedBox(height: 20),
          Text(
            widget.message!,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }
}
