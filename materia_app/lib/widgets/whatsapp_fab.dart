import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_colors.dart';
import '../data/app_data.dart' as data;

import 'package:provider/provider.dart';
import '../providers/content_provider.dart';

class WhatsAppFAB extends StatefulWidget {
  const WhatsAppFAB({super.key});

  @override
  State<WhatsAppFAB> createState() => _WhatsAppFABState();
}

class _WhatsAppFABState extends State<WhatsAppFAB>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.07).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _launchWhatsApp() async {
    final content = context.read<ContentProvider>();
    final phone = content.settings['whatsapp'] ?? data.settings['whatsapp'] ?? '201000000000';
    final url = Uri.parse('https://wa.me/$phone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _pulseAnimation.value,
            child: child,
          );
        },
        child: FloatingActionButton(
          onPressed: _launchWhatsApp,
          backgroundColor: AppColors.whatsappGreen,
          elevation: 1,
          highlightElevation: 2,
          shape: const CircleBorder(),
          child: const Icon(Icons.chat_rounded, color: Colors.white, size: 24),
        ),
      ),
    );
  }
}
