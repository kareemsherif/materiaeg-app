import 'package:flutter/material.dart';

class AppColors {
  // Exact Colors extracted directly from the Materia Logo
  static const logoBurgundy = Color(0xFF76252E); // Logo emblem & wordmark
  static const logoBurgundyDark = Color(0xFF5E1B23); // Deep burgundy shade
  static const logoBurgundyLight = Color(0xFF943440); // Soft burgundy highlight
  static const logoCharcoal = Color(0xFF2B2B2B); // "PREMIUM ARTIFICIAL LEATHER" subtitle

  // Burgundy palette (Primary brand identity)
  static const burgundy50 = Color(0xFFFAF2F3);
  static const burgundy100 = Color(0xFFF6E4E7);
  static const burgundy200 = Color(0xFFECC4CB);
  static const burgundy300 = Color(0xFFDF9EAA);
  static const burgundy400 = Color(0xFFCE6D80);
  static const burgundy500 = Color(0xFFB8455C);
  static const burgundy600 = Color(0xFFA02C45);
  static const burgundy700 = Color(0xFF8A2B35);
  static const burgundy800 = logoBurgundy; // 0xFF76252E
  static const burgundy900 = logoBurgundyDark; // 0xFF5E1B23
  static const burgundy950 = Color(0xFF380812);

  // Minimalist Charcoal / Monochrome palette
  static const charcoal50 = Color(0xFFF9F9F9);
  static const charcoal100 = Color(0xFFF2F2F2);
  static const charcoal200 = Color(0xFFE5E5E5);
  static const charcoal300 = Color(0xFFCCCCCC);
  static const charcoal400 = Color(0xFF999999);
  static const charcoal500 = Color(0xFF6E6E6E);
  static const charcoal600 = Color(0xFF4A4A4A);
  static const charcoal700 = logoCharcoal; // 0xFF2B2B2B
  static const charcoal800 = Color(0xFF222222);
  static const charcoal900 = Color(0xFF161616);
  static const charcoal950 = Color(0xFF0D0D0D);

  // Minimalist Neutrals / Alabaster
  static const cream50 = Color(0xFFFAFAFA);
  static const cream100 = Color(0xFFF5F5F5);
  static const cream200 = Color(0xFFEEEEEE);
  static const cream300 = Color(0xFFE2E2E2);
  static const cream400 = Color(0xFFD6D6D6);
  static const cream500 = Color(0xFFBDBDBD);
  static const cream600 = Color(0xFF9E9E9E);

  // Minimalist Semantic colors matching the logo
  static const primary = logoBurgundy;
  static const primaryDark = logoBurgundyDark;
  static const primaryDarkest = burgundy950;
  static const background = Color(0xFFFAFAFA);
  static const surface = Colors.white;
  static const surfaceSubtle = Color(0xFFF7F7F6);
  static const textPrimary = logoCharcoal;
  static const textSecondary = charcoal500;
  static const textLight = charcoal400;
  static const border = Color(0xFFEEEEEE);
  static const cardBorder = Color(0xFFEBEBEB);
  static const hairline = Color(0xFFEEEEEE);

  // Gradient (Subtle and refined using logo burgundy shades)
  static const burgundyGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [burgundy950, burgundy900, logoBurgundy],
  );

  // WhatsApp green
  static const whatsappGreen = Color(0xFF25D366);
}

