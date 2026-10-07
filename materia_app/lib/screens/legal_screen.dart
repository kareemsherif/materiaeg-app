import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/language_provider.dart';
import '../theme/app_colors.dart';

enum LegalDocType { privacy, terms }

class LegalScreen extends StatelessWidget {
  final LegalDocType type;

  const LegalScreen({
    super.key,
    required this.type,
  });

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _launchEmail(String email, String subject) async {
    final uri = Uri(
      scheme: 'mailto',
      path: email,
      queryParameters: {'subject': subject},
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final isPrivacy = type == LegalDocType.privacy;

    final title = isPrivacy
        ? (lang.isRTL ? 'سياسة الخصوصية' : 'Privacy Policy')
        : (lang.isRTL ? 'شروط الاستخدام' : 'Terms of Use');

    final webUrl = isPrivacy
        ? 'https://materiaeg.com/privacy'
        : 'https://materiaeg.com/terms';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.charcoal950,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(lang.isRTL ? Icons.arrow_forward_ios : Icons.arrow_back_ios, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w700,
            fontFamily: lang.isRTL ? 'Tajawal' : 'Playfair Display',
          ),
        ),
        actions: [
          IconButton(
            tooltip: lang.isRTL ? 'فتح في المتصفح' : 'Open in browser',
            icon: const Icon(Icons.open_in_browser_rounded, size: 22),
            onPressed: () => _openUrl(webUrl),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            // Professional Document Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.hairline),
              ),
              child: Row(
                textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      isPrivacy ? Icons.security_rounded : Icons.description_outlined,
                      color: AppColors.primary,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          isPrivacy
                            ? (lang.isRTL ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy & Data Protection')
                            : (lang.isRTL ? 'شروط وأحكام الاستخدام' : 'Terms of Use & Service'),
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: AppColors.charcoal900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          lang.isRTL
                              ? 'سارية المفعول – محدثة لعام ٢٠٢٦'
                              : 'Effective & Current – Updated 2026',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.charcoal500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Content Sections
            if (isPrivacy)
              ..._buildPrivacySections(context, lang)
            else
              ..._buildTermsSections(context, lang),

            const SizedBox(height: 24),

            // Web Policy & Deletion Actions
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.hairline),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Text(
                    lang.isRTL ? 'نسخة الويب الرسمية والمراسلات' : 'Official Web Version & Notices',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.charcoal900),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    lang.isRTL
                        ? 'يمكنك الاطلاع على النسخة الكاملة والمحدثة عبر موقعنا الإلكتروني الرسمي أو مراسلة فريق حماية البيانات.'
                        : 'Review the latest complete web documentation or contact our data protection team directly.',
                    style: const TextStyle(fontSize: 12, color: AppColors.charcoal600, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _openUrl(webUrl),
                          icon: const Icon(Icons.language_rounded, size: 16),
                          label: Text(lang.isRTL ? 'زيارة الموقع' : 'Open Web Page'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.primary,
                            side: const BorderSide(color: AppColors.primary),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      if (isPrivacy) ...[
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _launchEmail('info@materiaeg.com', 'Data Deletion Request'),
                            icon: const Icon(Icons.delete_outline_rounded, size: 16),
                            label: Text(lang.isRTL ? 'طلب حذف البيانات' : 'Delete Data'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildPrivacySections(BuildContext context, LanguageProvider lang) {
    final items = [
      {
        'titleEn': '1. Identity & Data Controller',
        'titleAr': '١. هوية الجهة المسؤولة عن البيانات',
        'descEn': 'MATERIA Premium Artificial Leather (operated by the Egyptian Company for Artificial Leather & Derivatives - EPEI) is the legal data controller. Registered address: 422 El-Gaish Rd, Alexandria, Egypt.',
        'descAr': 'علامة ماتيريا للجلود الصناعية الفاخرة (التابعة للشركة المصرية لإنتاج الجلود الصناعية ومشتقاتها) هي المسؤولة عن معالجة البيانات. المقر الرئيسي: ٤٢٢ طريق الجيش، الإسكندرية، مصر.',
      },
      {
        'titleEn': '2. Data We Collect',
        'titleAr': '٢. البيانات التي نجمعها',
        'descEn': 'We collect names, phone/WhatsApp numbers, business names, and delivery addresses for sample swatches and quotes. Standard device telemetry (device model, OS, crash reports) is processed anonymously to maintain app stability.',
        'descAr': 'نجمع الأسماء، وأرقام الهاتف/الواتساب، واسم المنشأة وعنوان توصيل العينات وعروض الأسعار. كما تُجمع بيانات فنية مجهولة المصدر لأداء واستقرار التطبيق.',
      },
      {
        'titleEn': '3. Third-Party Services & Google Policies',
        'titleAr': '٣. خدمات الطرف الثالث وتوافق Google',
        'descEn': 'We integrate with Google Play Services and standard analytics solely to distribute updates and diagnose system performance. We do NOT sell, rent, or trade your personal data to any external marketing parties.',
        'descAr': 'نعتمد على خدمات Google Play لتوزيع التحديثات وتشخيص كفاءة التطبيق. نؤكد التزامنا التام بعدم بيع أو تأجير أي بيانات شخصية لأي جهات خارجية نهائياً.',
      },
      {
        'titleEn': '4. Data Deletion & User Rights (Google Play)',
        'titleAr': '٤. حقوق المستخدم وآلية حذف البيانات',
        'descEn': 'In compliance with Google Play Store policies, you can request total deletion of your personal records at any time by emailing info@materiaeg.com with subject "Data Deletion Request". Requests are purged within 30 days.',
        'descAr': 'وفقاً لاشتراطات Google Play، يمكنك طلب مسح بياناتك نهائياً بإرسال بريد إلى info@materiaeg.com بعنوان "Data Deletion Request" وسيتم الحذف الكامل خلال ٣٠ يوماً.',
      },
      {
        'titleEn': '5. Children\'s Privacy',
        'titleAr': '٥. خصوصية الأطفال',
        'descEn': 'Our services and catalog are intended for commercial and adult industrial audiences. We do not knowingly collect personal information from individuals under 13 years of age.',
        'descAr': 'تطبيقنا وخدماتنا موجهة للأغراض الصناعية والتجارية والجمهور البالغ، ولا نجمع عمداً أي بيانات لأطفال دون سن ١٣ عاماً.',
      },
      {
        'titleEn': '6. Contact & Support',
        'titleAr': '٦. التواصل والدعم الفني',
        'descEn': 'For questions, contact us via info@materiaeg.com or hotline: 16870 / +20 129 005 3380.',
        'descAr': 'لأي استفسارات، تواصل معنا عبر البريد: info@materiaeg.com أو الخط الساخن: 16870.',
      },
    ];

    return items.map((sec) => _sectionCard(sec, lang)).toList();
  }

  List<Widget> _buildTermsSections(BuildContext context, LanguageProvider lang) {
    final items = [
      {
        'titleEn': '1. Acceptance & Scope',
        'titleAr': '١. قبول الشروط ونطاق الخدمة',
        'descEn': 'By accessing or using the MATERIA app or website, you agree to these Terms. Our platforms present industrial artificial leather solutions for automotive, furniture, and fashion sectors.',
        'descAr': 'يعد استخدامك لتطبيق أو موقع ماتيريا موافقة كاملة على هذه الشروط. تعرض منصاتنا حلول الجلود الصناعية لقطاعات السيارات والأثاث والموضة.',
      },
      {
        'titleEn': '2. Intellectual Property',
        'titleAr': '٢. حقوق الملكية الفكرية',
        'descEn': 'All trademarks, logos, embossing grains, technical specifications, and imagery belong exclusively to MATERIA and EPEI. Scraping or unauthorized commercial reproduction is strictly prohibited.',
        'descAr': 'جميع العلامات التجارية والشعارات والنقشات والمواصفات الفنية ملكية حصرية لشركة ماتيريا. يُحظر تماماً أي استنساخ أو استخراج آلي للبيانات دون إذن.',
      },
      {
        'titleEn': '3. Technical Specs & Tolerances',
        'titleAr': '٣. المواصفات الفنية والتفاوت الصناعي',
        'descEn': 'Digital screen colors may vary slightly from real production rolls. Industrial thickness and weight metrics are subject to standard factory variances (± 5% to 10%). Physical swatch testing is always recommended.',
        'descAr': 'قد تختلف ألوان الشاشات الرقمية طفيفاً عن لون الرولات الفعلي. تخضع القياسات لتفاوت صناعي قياسي (± 5% إلى 10%). نوصي دوماً باختبار عينات حقيقية.',
      },
      {
        'titleEn': '4. Complimentary Swatches & Quotes',
        'titleAr': '٤. العينات المجانية وعروض الأسعار',
        'descEn': 'Swatch swatches are provided free for verified manufacturing clients. Custom rolls and formal quotations remain valid for the period specified in sales correspondence.',
        'descAr': 'تُقدم كروت العينات مجاناً للمصانع والورش المسجلة. تسري عروض الأسعار للمدد المحددة في المكاتبات الرسمية نظراً لتغير تكاليف المواد الخام.',
      },
      {
        'titleEn': '5. Governing Law & Jurisdiction',
        'titleAr': '٥. القانون الحاكم والنزاعات',
        'descEn': 'These terms are governed by the laws of the Arab Republic of Egypt. The competent commercial courts of Alexandria and Sadat City hold exclusive jurisdiction.',
        'descAr': 'تخضع هذه الشروط لقوانين جمهورية مصر العربية، وتختص المحاكم الاقتصادية والتجارية المختصة بالإسكندرية ومدينة السادات بأي نزاع.',
      },
    ];

    return items.map((sec) => _sectionCard(sec, lang)).toList();
  }

  Widget _sectionCard(Map<String, String> sec, LanguageProvider lang) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.hairline),
      ),
      child: Column(
        crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Text(
            lang.isRTL ? sec['titleAr']! : sec['titleEn']!,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.charcoal900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            lang.isRTL ? sec['descAr']! : sec['descEn']!,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.charcoal600,
              height: 1.5,
            ),
            textAlign: lang.isRTL ? TextAlign.right : TextAlign.left,
          ),
        ],
      ),
    );
  }
}
