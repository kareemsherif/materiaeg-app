import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import 'legal_screen.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    final timeline = [
      {'year': '1970', 'en': 'Founded as a public sector company (EPEI), pioneering the artificial leather industry in Egypt.', 'ar': 'التأسيس كشركة تابعة للقطاع العام (EPEI)، وريادة صناعة الجلود الصناعية في مصر.'},
      {'year': '2000', 'en': 'Transitioned to a private entity, enhancing flexibility and focus on customer requirements.', 'ar': 'التحول إلى كيان خاص، لتعزيز المرونة والتركيز على تلبية متطلبات العملاء.'},
      {'year': '2025', 'en': 'Started a new transformative phase with the move to a state-of-the-art facility in Sadat Industrial Zone.', 'ar': 'بدء مرحلة تحولية جديدة مع الانتقال إلى منشأة متطورة في منطقة السادات الصناعية.'},
      {'year': '2026', 'en': 'Launch of Materia: Next-gen materials for the future.', 'ar': 'إطلاق علامة ماتيريا: مواد من الجيل الجديد للمستقبل.'},
    ];

    final facilityFeatures = lang.isRTL
        ? ['آلات إنتاج متطورة من الجيل الأخير', 'زيادة كبيرة في الطاقة الإنتاجية', 'أنظمة متكاملة لضمان استمرارية الجودة', 'تصميم حديث يراعي المسؤولية البيئية']
        : ['Advanced latest-generation production machinery', 'Significant boost in production capacity', 'Integrated systems for consistent quality assurance', 'Modern design focused on environmental responsibility'];

    final categories = [
      {'en': 'Fashion', 'ar': 'الموضة والملابس', 'descEn': 'Footwear, bags, and apparel', 'descAr': 'خامات عصرية للأحذية والحقائب والملابس'},
      {'en': 'Furniture', 'ar': 'الأثاث والتنجيد', 'descEn': 'Home and office upholstery', 'descAr': 'مواد عالية الأداء لأثاث المنازل والمكاتب'},
      {'en': 'Automotive', 'ar': 'ديكورات السيارات', 'descEn': 'Durable car seat interiors', 'descAr': 'خامات تقنية متينة لمقاعد وتشطيبات السيارات'},
      {'en': 'Specialized', 'ar': 'تطبيقات متخصصة', 'descEn': 'Custom industrial solutions', 'descAr': 'حلول مصممة خصيصاً للاحتياجات الصناعية'},
    ];

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero
            Stack(
              children: [
                SizedBox(
                  height: 320,
                  width: double.infinity,
                  child: Image.asset('assets/images/hero.jpg', fit: BoxFit.cover),
                ),
                Container(
                  height: 320,
                  color: AppColors.charcoal950.withValues(alpha: 0.8),
                ),
                Positioned.fill(
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Top bar with Emblem & Language toggle
                          Row(
                            textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
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
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: Colors.white24, width: 0.8),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(lang.t('nav.lang'),
                                      style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                            children: [
                              Container(height: 1, width: 24, color: AppColors.burgundy500),
                              const SizedBox(width: 8),
                              Text(
                                lang.isRTL ? 'شركتنا' : 'Our Company',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.burgundy400, letterSpacing: 2),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(lang.t('about.title'), style: AppTheme.heading(32, lang.isRTL, color: Colors.white)),
                          const SizedBox(height: 8),
                          Text(lang.t('about.subtitle'),
                              style: AppTheme.body(14, color: AppColors.charcoal200, isRTL: lang.isRTL)),
                          const Spacer(),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Stats
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              child: Row(
                children: [
                  _statItem(lang.t('about.stat1'), lang.t('about.stat1.label'), lang.isRTL),
                  _statItem(lang.t('about.stat2'), lang.t('about.stat2.label'), lang.isRTL),
                  _statItem(lang.t('about.stat3'), lang.t('about.stat3.label'), lang.isRTL),
                  _statItem(lang.t('about.stat4'), lang.t('about.stat4.label'), lang.isRTL),
                ],
              ),
            ),

            const Divider(height: 1, color: AppColors.cream200),

            // Timeline
            Container(
              color: AppColors.cream50,
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Text(
                    lang.isRTL ? 'رحلتنا عبر العقود' : 'Our Journey Through Decades',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary, letterSpacing: 2),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    lang.isRTL ? 'من العراقة إلى الابتكار الحديث' : 'From Heritage to Modern Innovation',
                    style: AppTheme.heading(24, lang.isRTL),
                  ),
                  const SizedBox(height: 24),
                  ...timeline.map((item) => _timelineItem(item, lang)),
                ],
              ),
            ),

            // Factory image + features
            Container(
              color: AppColors.cream50,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Stack(
                      children: [
                        Image.asset('assets/images/factory.jpg', width: double.infinity, height: 220, fit: BoxFit.cover),
                        Positioned(
                          bottom: 12,
                          right: lang.isRTL ? null : 12,
                          left: lang.isRTL ? 12 : null,
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('2025', style: AppTheme.heading(22, lang.isRTL, color: Colors.white)),
                                Text(
                                  lang.isRTL ? 'نقلة تكنولوجية كبرى' : 'A Strategic Tech Leap',
                                  style: const TextStyle(fontSize: 10, color: AppColors.burgundy200, letterSpacing: 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.cream200),
                    ),
                    child: Column(
                      crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          lang.isRTL ? 'منشأة منطقة السادات الصناعية' : 'Sadat Industrial Zone Facility',
                          style: AppTheme.body(16, weight: FontWeight.w700, color: AppColors.charcoal900, isRTL: lang.isRTL),
                        ),
                        const SizedBox(height: 12),
                        ...facilityFeatures.map((f) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                                children: [
                                  Icon(Icons.check_circle_rounded, size: 16, color: Colors.green.shade600),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(f, style: AppTheme.body(13, color: AppColors.charcoal600, isRTL: lang.isRTL)),
                                  ),
                                ],
                              ),
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),

            // Categories
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text(
                    lang.isRTL ? 'حلول شاملة لكل قطاع' : 'Comprehensive Solutions for Every Sector',
                    style: AppTheme.heading(22, lang.isRTL),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    lang.isRTL
                        ? 'نقدم تشكيلة واسعة من منتجات الجلود الصناعية المصممة لتلبية احتياجاتك الخاصة'
                        : 'We offer a wide range of artificial leather products engineered to meet your specific needs.',
                    style: AppTheme.body(13, color: AppColors.charcoal500, isRTL: lang.isRTL),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 1.4,
                    ),
                    itemCount: categories.length,
                    itemBuilder: (context, i) {
                      final cat = categories[i];
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.cream50,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cream100),
                        ),
                        child: Column(
                          crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              lang.isRTL ? cat['ar']! : cat['en']!,
                              style: AppTheme.body(14, weight: FontWeight.w700, color: AppColors.primary, isRTL: lang.isRTL),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              lang.isRTL ? cat['descAr']! : cat['descEn']!,
                              style: AppTheme.body(11, color: AppColors.charcoal500, isRTL: lang.isRTL),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // CTA
            Container(
              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
              decoration: const BoxDecoration(gradient: AppColors.burgundyGradient),
              child: Column(
                children: [
                  Text(
                    lang.isRTL ? 'شريكك الموثوق في الخامات الفاخرة' : 'Your Trusted Premium Materials Partner',
                    style: AppTheme.heading(24, lang.isRTL, color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    lang.isRTL ? 'تواصل معنا اليوم لمناقشة متطلبات مشروعك' : 'Reach out today to discuss your project requirements',
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
                    label: Text(lang.t('contact.title')),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Legal & Policies (Google Play Compliance)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.hairline),
                ),
                child: Column(
                  crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    Row(
                      textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                      children: [
                        const Icon(Icons.shield_outlined, size: 18, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Text(
                          lang.isRTL ? 'السياسات والشروط القانونية' : 'Legal & Policies',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.charcoal800),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Divider(color: AppColors.hairline, height: 1),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.privacy_tip_outlined, color: AppColors.primary, size: 20),
                      title: Text(
                        lang.isRTL ? 'سياسة الخصوصية' : 'Privacy Policy',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.charcoal900),
                      ),
                      subtitle: Text(
                        lang.isRTL ? 'حماية البيانات ومتطلبات Google Play' : 'Data protection & Google Play compliance',
                        style: const TextStyle(fontSize: 11, color: AppColors.charcoal500),
                      ),
                      trailing: Icon(
                        lang.isRTL ? Icons.arrow_back_ios_new : Icons.arrow_forward_ios,
                        size: 14,
                        color: AppColors.charcoal400,
                      ),
                      onTap: () {
                        HapticFeedback.lightImpact();
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LegalScreen(type: LegalDocType.privacy),
                          ),
                        );
                      },
                    ),
                    const Divider(color: AppColors.hairline, height: 1),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.description_outlined, color: AppColors.primary, size: 20),
                      title: Text(
                        lang.isRTL ? 'شروط الاستخدام' : 'Terms of Use',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.charcoal900),
                      ),
                      subtitle: Text(
                        lang.isRTL ? 'الأحكام المنظمة للعينات والمواصفات' : 'Terms governing samples & specifications',
                        style: const TextStyle(fontSize: 11, color: AppColors.charcoal500),
                      ),
                      trailing: Icon(
                        lang.isRTL ? Icons.arrow_back_ios_new : Icons.arrow_forward_ios,
                        size: 14,
                        color: AppColors.charcoal400,
                      ),
                      onTap: () {
                        HapticFeedback.lightImpact();
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const LegalScreen(type: LegalDocType.terms),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String stat, String label, bool isRTL) {
    return Expanded(
      child: Column(
        children: [
          Text(stat, style: AppTheme.heading(28, isRTL, color: AppColors.primary)),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 9, color: AppColors.charcoal500, letterSpacing: 1, fontWeight: FontWeight.w500),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _timelineItem(Map<String, String> item, LanguageProvider lang) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: 20,
        left: lang.isRTL ? 0 : 20,
        right: lang.isRTL ? 20 : 0,
      ),
      child: Row(
        textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4),
                  ],
                ),
              ),
              Container(width: 1, height: 40, color: AppColors.cream300),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Text(
                  item['year']!,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary),
                ),
                const SizedBox(height: 2),
                Text(
                  lang.isRTL ? item['ar']! : item['en']!,
                  style: AppTheme.body(13, color: AppColors.charcoal600, isRTL: lang.isRTL),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
