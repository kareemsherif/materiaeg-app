import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class SectionHeader extends StatelessWidget {
  final String tagline;
  final String title;
  final String? subtitle;
  final bool isRTL;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SectionHeader({
    super.key,
    required this.tagline,
    required this.title,
    this.subtitle,
    required this.isRTL,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          textDirection: isRTL ? TextDirection.rtl : TextDirection.ltr,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Text(
                    tagline.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    title,
                    style: AppTheme.heading(22, isRTL, weight: FontWeight.w700),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      subtitle!,
                      style: AppTheme.body(13, color: AppColors.charcoal500, isRTL: isRTL),
                    ),
                  ],
                ],
              ),
            ),
            if (actionLabel != null)
              GestureDetector(
                onTap: onAction,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    textDirection: isRTL ? TextDirection.rtl : TextDirection.ltr,
                    children: [
                      Text(
                        actionLabel!,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.charcoal900,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        isRTL ? Icons.arrow_back_ios_new_rounded : Icons.arrow_forward_ios_rounded,
                        size: 11,
                        color: AppColors.charcoal900,
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
