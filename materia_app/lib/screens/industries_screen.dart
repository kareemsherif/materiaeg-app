import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../data/app_data.dart' as data;
import '../widgets/materia_app_bar.dart';

class IndustriesScreen extends StatelessWidget {
  const IndustriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Header
          SliverToBoxAdapter(
            child: MateriaAppBar(
              breadcrumb: [lang.t('nav.home'), lang.t('nav.industries')],
              title: lang.t('industries.title'),
              subtitle: lang.t('industries.subtitle'),
            ),
          ),

          // Industries list
          SliverPadding(
            padding: const EdgeInsets.all(16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, i) {
                  final industry = data.industries[i];
                  final industryProducts = data.products
                      .where((p) => industry.products.contains(p.id))
                      .toList();

                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.hairline, width: 1),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Image
                        AspectRatio(
                          aspectRatio: 16 / 9,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset(industry.image, fit: BoxFit.cover),
                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withValues(alpha: 0.6),
                                    ],
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 12,
                                left: lang.isRTL ? null : 16,
                                right: lang.isRTL ? 16 : null,
                                child: Text(
                                  industry.name.get(lang.lang),
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Content
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                            children: [
                              Text(
                                industry.description.get(lang.lang),
                                style: AppTheme.body(13, color: AppColors.charcoal600, isRTL: lang.isRTL),
                                textAlign: lang.isRTL ? TextAlign.right : TextAlign.left,
                              ),
                              const SizedBox(height: 14),

                              // Applications
                              Text(
                                (lang.isRTL ? 'التطبيقات' : 'Applications').toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.charcoal400,
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                                children: industry.applications.map((app) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceSubtle,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: AppColors.hairline, width: 0.5),
                                    ),
                                    child: Text(
                                      app,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.charcoal700,
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),

                              // Recommended products
                              if (industryProducts.isNotEmpty) ...[
                                const SizedBox(height: 14),
                                Text(
                                  (lang.isRTL ? 'الخامات الموصى بها' : 'Recommended Materials').toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.charcoal400,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                                  children: industryProducts.map((p) {
                                    return GestureDetector(
                                      onTap: () {
                                        HapticFeedback.lightImpact();
                                        Navigator.pushNamed(context, '/product', arguments: p.slug);
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceSubtle,
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: AppColors.hairline, width: 0.8),
                                        ),
                                        child: Text(
                                          p.name.get(lang.lang),
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.charcoal900,
                                          ),
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ],

                              const SizedBox(height: 14),
                              Row(
                                textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    lang.isRTL ? 'استكشف الخامات' : 'Explore Materials',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.charcoal900,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Icon(
                                    lang.isRTL ? Icons.arrow_back_ios_new_rounded : Icons.arrow_forward_ios_rounded,
                                    size: 11,
                                    color: AppColors.charcoal900,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
                childCount: data.industries.length,
              ),
            ),
          ),

          // CTA
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
              decoration: const BoxDecoration(gradient: AppColors.burgundyGradient),
              child: Column(
                children: [
                  Text(
                    lang.isRTL ? 'ابحث عن الخامة المثالية لصناعتك' : 'Find the Perfect Material for Your Industry',
                    style: AppTheme.heading(24, lang.isRTL, color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    lang.isRTL
                        ? 'فريق متخصص جاهز لمساعدتك في اختيار أفضل الخامات لمشروعك'
                        : 'Our specialists are ready to help you choose the best materials for your project',
                    style: AppTheme.body(13, color: AppColors.burgundy200, isRTL: lang.isRTL),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      Navigator.pushReplacementNamed(context, '/main', arguments: 4);
                    },
                    icon: Icon(lang.isRTL ? Icons.arrow_back_rounded : Icons.arrow_forward_rounded, size: 18),
                    label: Text(lang.t('nav.quote')),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
