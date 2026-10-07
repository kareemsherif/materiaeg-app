import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Reusable top bar widget with MATERIA emblem + language toggle.
/// Replaces duplicated code across 5 screens.
class MateriaAppBar extends StatelessWidget {
  /// Whether this bar appears over a dark background (hero) or standalone dark header
  final bool isDark;

  /// Optional breadcrumb: e.g. ['Home', 'Products']
  final List<String>? breadcrumb;

  /// Page title (shown below breadcrumb)
  final String? title;

  /// Page subtitle
  final String? subtitle;

  /// Extra bottom padding
  final double bottomPadding;

  const MateriaAppBar({
    super.key,
    this.isDark = true,
    this.breadcrumb,
    this.title,
    this.subtitle,
    this.bottomPadding = 24,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Container(
      color: isDark ? AppColors.charcoal950 : Colors.transparent,
      padding: EdgeInsets.only(
        top: isDark ? MediaQuery.of(context).padding.top + 16 : 0,
        left: 20,
        right: 20,
        bottom: bottomPadding,
      ),
      child: Column(
        crossAxisAlignment:
            lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          // Top bar with Emblem & Language toggle
          Row(
            textDirection:
                lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                textDirection: TextDirection.ltr,
                children: [
                  Image.asset('assets/images/emblem.png', height: 22),
                  const SizedBox(width: 8),
                  const Text(
                    'MATERIA',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 2.2,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: lang.toggleLang,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white24, width: 0.8),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    lang.t('nav.lang'),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Breadcrumb
          if (breadcrumb != null && breadcrumb!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Row(
              textDirection:
                  lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
              children: _buildBreadcrumbItems(),
            ),
          ],

          // Title
          if (title != null) ...[
            const SizedBox(height: 12),
            Text(
              title!,
              style: AppTheme.heading(28, lang.isRTL, color: Colors.white),
            ),
          ],

          // Subtitle
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: AppTheme.body(13,
                  color: AppColors.charcoal300, isRTL: lang.isRTL),
            ),
          ],
        ],
      ),
    );
  }

  List<Widget> _buildBreadcrumbItems() {
    final items = <Widget>[];
    for (int i = 0; i < breadcrumb!.length; i++) {
      final isLast = i == breadcrumb!.length - 1;
      items.add(Text(
        breadcrumb![i],
        style: TextStyle(
          fontSize: 11,
          color: isLast ? Colors.white : AppColors.charcoal400,
        ),
      ));
      if (!isLast) {
        items.add(const Text(
          ' / ',
          style: TextStyle(fontSize: 11, color: AppColors.charcoal400),
        ));
      }
    }
    return items;
  }
}
