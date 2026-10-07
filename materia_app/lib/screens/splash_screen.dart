import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeOut)),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack)),
    );

    _controller.forward();

    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/main');
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _skip() {
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/main');
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _skip,
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: Center(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Opacity(
                opacity: _fadeAnimation.value,
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Authentic Materia Logo with safe fallback
                      Image.asset(
                        'assets/images/logo.png',
                        width: 240,
                        errorBuilder: (context, error, stackTrace) {
                          return Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Image.asset(
                                'assets/images/emblem.png',
                                height: 48,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.layers,
                                  size: 48,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'MATERIA',
                                style: TextStyle(
                                  color: AppColors.charcoal950,
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 4,
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 36),
                      // Minimal loading indicator using logo burgundy
                      const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
