import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/language_provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../data/app_data.dart' as data;
import '../widgets/product_card.dart';
import '../widgets/section_header.dart';
import '../widgets/shimmer_loading.dart';
import 'products_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final content = context.watch<ContentProvider>();

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: content.refresh,
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── HERO ──
              _buildHero(context, lang),

              // ── AI SCANNER BANNER ──
              _buildAiScannerBanner(context, lang),

              // ── FEATURED PRODUCTS ──
              _buildFeaturedProducts(context, lang, content),

              // ── WHY MATERIA ──
              _buildWhySection(context, lang),

              // ── INDUSTRIES ──
              _buildIndustries(context, lang),

              // ── STATS ──
              _buildStats(context, lang),

              // ── CTA BANNER ──
              _buildCtaBanner(context, lang),
            ],
        ),
      ),
    ),
  );
}

  Widget _buildHero(BuildContext context, LanguageProvider lang) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final isCompact = screenWidth < 360;

    return Stack(
      children: [
        // Background image
        Positioned.fill(
          child: Image.asset(
            'assets/images/hero.jpg',
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(color: AppColors.charcoal950),
          ),
        ),
        // Minimalist gradient overlay
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: lang.isRTL ? Alignment.centerRight : Alignment.centerLeft,
                end: lang.isRTL ? Alignment.centerLeft : Alignment.centerRight,
                colors: [
                  AppColors.charcoal950.withValues(alpha: 0.94),
                  AppColors.charcoal950.withValues(alpha: 0.78),
                  AppColors.charcoal950.withValues(alpha: 0.40),
                ],
              ),
            ),
          ),
        ),
        // Content with responsive min-height and padding
        ConstrainedBox(
          constraints: BoxConstraints(
            minWidth: double.infinity,
            minHeight: (screenHeight * 0.62).clamp(480.0, 620.0),
          ),
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: isCompact ? 16 : 20,
                vertical: 12,
              ),
              child: Column(
                crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top Brand Bar (Logo Emblem + Language)
                  Row(
                    textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        textDirection: TextDirection.ltr,
                        children: [
                          Image.asset('assets/images/emblem.png', height: 26),
                          const SizedBox(width: 8),
                          const Text(
                            'MATERIA',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2.5,
                            ),
                          ),
                        ],
                      ),
                      GestureDetector(
                        onTap: () {
                          HapticFeedback.lightImpact();
                          lang.toggleLang();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white24, width: 0.8),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            lang.t('nav.lang'),
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 28),

                  // Middle Content
                  Column(
                    crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                    children: [
                      // Tagline
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                        children: [
                          Container(height: 1, width: 20, color: AppColors.burgundy400),
                          const SizedBox(width: 8),
                          Text(
                            lang.t('hero.tagline').toUpperCase(),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.burgundy300,
                              letterSpacing: 2.2,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      // Title
                      Text(
                        lang.t('hero.title'),
                        style: AppTheme.heading(isCompact ? 26 : 32, lang.isRTL, color: Colors.white),
                        textAlign: lang.isRTL ? TextAlign.right : TextAlign.left,
                      ),
                      const SizedBox(height: 12),
                      // Subtitle
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 340),
                        child: Text(
                          lang.t('hero.subtitle'),
                          style: AppTheme.body(isCompact ? 12 : 13, color: AppColors.charcoal200, isRTL: lang.isRTL),
                          textAlign: lang.isRTL ? TextAlign.right : TextAlign.left,
                        ),
                      ),
                      const SizedBox(height: 22),
                      // CTAs
                      Wrap(
                        spacing: 12,
                        runSpacing: 10,
                        textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              _navigateToTab(context, 1);
                            },
                            icon: Icon(
                              lang.isRTL ? Icons.arrow_back_rounded : Icons.arrow_forward_rounded,
                              size: 16,
                            ),
                            label: Text(lang.t('hero.cta.explore')),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppColors.charcoal950,
                              padding: EdgeInsets.symmetric(
                                horizontal: isCompact ? 18 : 22,
                                vertical: 14,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              elevation: 0,
                            ),
                          ),
                          OutlinedButton(
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              _navigateToTab(context, 2);
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Color(0x66FFFFFF), width: 1),
                              padding: EdgeInsets.symmetric(
                                horizontal: isCompact ? 18 : 22,
                                vertical: 14,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: Text(lang.t('hero.cta.industries')),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 28),

                  // Stats (with responsive Expanded)
                  Row(
                    textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                    children: [
                      Expanded(child: _statItem(lang.t('hero.stat1'), lang.t('hero.stat1.label'), lang.isRTL, isCompact)),
                      Container(
                        height: 28,
                        width: 1,
                        color: Colors.white12,
                        margin: const EdgeInsets.symmetric(horizontal: 10),
                      ),
                      Expanded(child: _statItem(lang.t('hero.stat2'), lang.t('hero.stat2.label'), lang.isRTL, isCompact)),
                      Container(
                        height: 28,
                        width: 1,
                        color: Colors.white12,
                        margin: const EdgeInsets.symmetric(horizontal: 10),
                      ),
                      Expanded(child: _statItem(lang.t('hero.stat3'), lang.t('hero.stat3.label'), lang.isRTL, isCompact)),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _statItem(String stat, String label, bool isRTL, [bool isCompact = false]) {
    return Column(
      crossAxisAlignment: isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            stat,
            style: AppTheme.heading(isCompact ? 19 : 22, isRTL, color: Colors.white),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label.toUpperCase(),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: isCompact ? 8 : 9,
            color: AppColors.charcoal300,
            letterSpacing: 1.2,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturedProducts(BuildContext context, LanguageProvider lang, ContentProvider content) {
    final featured = content.featuredProducts;
    final isLoading = content.isLoading;

    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
      child: Column(
        children: [
          SectionHeader(
            tagline: lang.isRTL ? 'مجموعتنا' : 'Our Collection',
            title: lang.t('products.title'),
            subtitle: lang.t('products.subtitle'),
            isRTL: lang.isRTL,
            actionLabel: lang.isRTL ? 'عرض كل الخامات' : 'View All Materials',
            onAction: () {
              HapticFeedback.lightImpact();
              _navigateToTab(context, 1);
            },
          ),
          const SizedBox(height: 16),

          // Grain Categories Quick Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            reverse: lang.isRTL,
            child: Row(
              textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
              children: [
                _grainCategoryChip(
                  context,
                  lang,
                  titleAr: 'نقشات ناعمة وخامات ملساء',
                  titleEn: 'Fine Grains & Smooth',
                  icon: Icons.blur_on_rounded,
                  categoryKey: 'fine-grains',
                ),
                const SizedBox(width: 8),
                _grainCategoryChip(
                  context,
                  lang,
                  titleAr: 'نقشات متوسطة وكبيرة',
                  titleEn: 'Medium & Large Grains',
                  icon: Icons.grain_rounded,
                  categoryKey: 'medium-large',
                ),
                const SizedBox(width: 8),
                _grainCategoryChip(
                  context,
                  lang,
                  titleAr: 'أقمشة وجلود نادرة',
                  titleEn: 'Textile & Exotic Grains',
                  icon: Icons.texture_rounded,
                  categoryKey: 'textile',
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Products list with shimmer loading
          if (isLoading && featured.isEmpty)
            ...List.generate(3, (i) => const Padding(
              padding: EdgeInsets.only(bottom: 14),
              child: ProductCardSkeleton(),
            ))
          else
            ...featured.take(4).map((product) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: ProductCard(product: product),
                )),
        ],
      ),
    );
  }

  Widget _grainCategoryChip(
    BuildContext context,
    LanguageProvider lang, {
    required String titleAr,
    required String titleEn,
    required IconData icon,
    required String categoryKey,
  }) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ProductsScreen(initialCategory: categoryKey),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.hairline),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
          children: [
            Icon(icon, size: 15, color: AppColors.primary),
            const SizedBox(width: 7),
            Text(
              lang.isRTL ? titleAr : titleEn,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.charcoal800,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWhySection(BuildContext context, LanguageProvider lang) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isCompact = screenWidth < 360;
    final isTablet = screenWidth > 600;
    final childRatio = isCompact ? 1.05 : (screenWidth < 400 ? 1.15 : 1.28);
    final crossCount = isTablet ? 4 : 2;

    final features = [
      {'icon': Icons.water_drop_outlined, 'key': 'why.waterproof'},
      {'icon': Icons.shield_outlined, 'key': 'why.scratch'},
      {'icon': Icons.bolt_outlined, 'key': 'why.softness'},
      {'icon': Icons.air_outlined, 'key': 'why.longevity'},
      {'icon': Icons.auto_awesome_outlined, 'key': 'why.colors'},
      {'icon': Icons.wb_sunny_outlined, 'key': 'why.uv'},
      {'icon': Icons.eco_outlined, 'key': 'why.eco'},
      {'icon': Icons.layers_outlined, 'key': 'why.flexible'},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
      child: Column(
        children: [
          SectionHeader(
            tagline: lang.isRTL ? 'مميزات الخامة' : 'Material Features',
            title: lang.t('why.title'),
            isRTL: lang.isRTL,
          ),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossCount,
              childAspectRatio: childRatio,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemCount: features.length,
            itemBuilder: (context, i) {
              final f = features[i];
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.hairline, width: 1),
                  color: AppColors.surfaceSubtle,
                ),
                child: Column(
                  crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.hairline, width: 0.5),
                      ),
                      child: Icon(f['icon'] as IconData, size: 17, color: AppColors.charcoal800),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      lang.t(f['key'] as String),
                      style: AppTheme.body(isCompact ? 12 : 13, weight: FontWeight.w600, color: AppColors.charcoal900, isRTL: lang.isRTL),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Expanded(
                      child: Text(
                        lang.t('${f['key']}.desc'),
                        style: AppTheme.body(isCompact ? 10 : 11, color: AppColors.charcoal500, isRTL: lang.isRTL),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildIndustries(BuildContext context, LanguageProvider lang) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > 600;
    final crossCount = isTablet ? 4 : 2;

    return Container(
      color: AppColors.background,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
      child: Column(
        children: [
          SectionHeader(
            tagline: lang.isRTL ? 'قطاعاتنا' : 'Our Sectors',
            title: lang.t('industries.title'),
            subtitle: lang.t('industries.subtitle'),
            isRTL: lang.isRTL,
            actionLabel: lang.isRTL ? 'عرض كل القطاعات' : 'All Industries',
            onAction: () {
              HapticFeedback.lightImpact();
              _navigateToTab(context, 2);
            },
          ),
          const SizedBox(height: 20),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: crossCount,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: isTablet ? 1.2 : 1.0,
            ),
            itemCount: data.industries.length,
            itemBuilder: (context, i) {
              final industry = data.industries[i];
              return GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  _navigateToTab(context, 2);
                },
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
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
                              Colors.black.withValues(alpha: 0.72),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 12,
                        left: lang.isRTL ? null : 12,
                        right: lang.isRTL ? 12 : null,
                        child: Text(
                          industry.name.get(lang.lang),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStats(BuildContext context, LanguageProvider lang) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isCompact = screenWidth < 360;

    final stats = [
      {'icon': Icons.inventory_2_outlined, 'stat': lang.t('about.stat1'), 'label': lang.t('about.stat1.label')},
      {'icon': Icons.factory_outlined, 'stat': lang.t('about.stat2'), 'label': lang.t('about.stat2.label')},
      {'icon': Icons.public_outlined, 'stat': lang.t('about.stat3'), 'label': lang.t('about.stat3.label')},
      {'icon': Icons.layers_outlined, 'stat': lang.t('about.stat4'), 'label': lang.t('about.stat4.label')},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
      child: Row(
        children: stats.map((s) {
          return Expanded(
            child: Column(
              children: [
                Container(
                  width: isCompact ? 34 : 40,
                  height: isCompact ? 34 : 40,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.hairline, width: 0.5),
                  ),
                  child: Icon(s['icon'] as IconData, size: isCompact ? 16 : 18, color: AppColors.charcoal800),
                ),
                const SizedBox(height: 8),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    s['stat'] as String,
                    style: AppTheme.heading(isCompact ? 18 : 20, lang.isRTL, color: AppColors.charcoal900),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  (s['label'] as String).toUpperCase(),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: isCompact ? 7.5 : 8,
                    color: AppColors.charcoal500,
                    letterSpacing: 0.8,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCtaBanner(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 44, horizontal: 24),
      decoration: const BoxDecoration(
        color: AppColors.charcoal950,
      ),
      child: Column(
        children: [
          Text(
            lang.t('cta.sample.title'),
            style: AppTheme.heading(24, lang.isRTL, color: Colors.white),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 10),
          Text(
            lang.t('cta.sample.subtitle'),
            style: AppTheme.body(13, color: AppColors.charcoal300, isRTL: lang.isRTL),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  _navigateToTab(context, 4);
                },
                icon: Icon(
                  lang.isRTL ? Icons.arrow_back_rounded : Icons.arrow_forward_rounded,
                  size: 16,
                ),
                label: Text(lang.t('product.requestSample')),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.charcoal950,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
              ),
              OutlinedButton.icon(
                onPressed: () async {
                  HapticFeedback.lightImpact();
                  final content = context.read<ContentProvider>();
                  final phone = content.settings['whatsapp'] ?? data.settings['whatsapp'] ?? '201000000000';
                  final url = Uri.parse('https://wa.me/$phone');
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.chat_rounded, size: 16),
                label: const Text('WhatsApp'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Color(0x66FFFFFF), width: 1),
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _navigateToTab(BuildContext context, int index) {
    Navigator.pushReplacementNamed(context, '/main', arguments: index);
  }

  Widget _buildAiScannerBanner(BuildContext context, LanguageProvider lang) {
    final isAr = lang.isArabic;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 20, 16, 4),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.charcoal950,
            AppColors.burgundy950,
            AppColors.logoBurgundyDark,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.burgundy700.withValues(alpha: 0.45)),
        boxShadow: [
          BoxShadow(
            color: AppColors.logoBurgundy.withValues(alpha: 0.18),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: () {
            HapticFeedback.mediumImpact();
            _navigateToTab(context, 2);
          },
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                // Scanner Icon with decorative frame
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white24, width: 1),
                  ),
                  child: const Icon(
                    Icons.document_scanner_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 14),
                // Text & Badge
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.burgundy400.withValues(alpha: 0.35),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.auto_awesome,
                                  size: 12, color: Colors.white),
                              const SizedBox(width: 4),
                              Text(
                                isAr
                                    ? 'جديد • الذكاء الاصطناعي'
                                    : 'NEW • AI VISION',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        lang.t('scanner.title'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        isAr
                            ? 'صوّر أي عينة واكتشف مطابقتها مع خاماتنا فوراً'
                            : 'Scan any leather to match with Materia catalog',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.8),
                          fontSize: 11.5,
                          height: 1.35,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  isAr ? Icons.arrow_back_ios_new : Icons.arrow_forward_ios,
                  color: Colors.white70,
                  size: 15,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

