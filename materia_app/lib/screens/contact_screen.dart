import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/language_provider.dart';
import '../providers/content_provider.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../data/app_data.dart' as app_data;
import '../widgets/materia_app_bar.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  String _name = '', _phone = '', _email = '', _company = '', _message = '';
  bool _submitted = false;
  bool _loading = false;

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    HapticFeedback.mediumImpact();
    setState(() => _loading = true);
    final success = await ApiService.submitContactMessage(
      name: _name,
      phone: _phone,
      email: _email,
      company: _company,
      message: _message,
    );
    if (mounted) {
      if (success) {
        HapticFeedback.heavyImpact();
        setState(() {
          _loading = false;
          _submitted = true;
        });
      } else {
        setState(() => _loading = false);
        final lang = context.read<LanguageProvider>();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(lang.isRTL
                ? 'تعذر إرسال الرسالة، يرجى المحاولة لاحقاً أو التواصل عبر واتساب'
                : 'Failed to send message, please try again or contact via WhatsApp'),
            backgroundColor: Colors.red.shade800,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final content = context.watch<ContentProvider>();
    final settings = content.settings;
    final whatsapp = settings['whatsapp'] ?? app_data.settings['whatsapp']!;
    final email = settings['email'] ?? app_data.settings['email']!;
    final hotline = settings['hotline'] ?? app_data.settings['hotline']!;
    final address1 = settings['address'] ?? app_data.settings['address']!;
    final address2 = settings['address2'] ?? app_data.settings['address2']!;
    final website = settings['website'] ?? app_data.settings['website']!;

    final contactInfo = [
      {'icon': Icons.location_on_outlined, 'label': lang.isRTL ? 'الإدارة' : 'Administration', 'value': lang.isRTL ? lang.t('contact.address1') : address1},
      {'icon': Icons.factory_outlined, 'label': lang.isRTL ? 'المصنع' : 'Factory', 'value': lang.isRTL ? lang.t('contact.address2') : address2},
      {'icon': Icons.phone_outlined, 'label': lang.isRTL ? 'الخط الساخن' : 'Hotline', 'value': hotline, 'action': () => launchUrl(Uri.parse('tel:$hotline'))},
      {'icon': Icons.mail_outlined, 'label': lang.isRTL ? 'البريد الإلكتروني' : 'Email', 'value': email, 'action': () => launchUrl(Uri.parse('mailto:$email'))},
      {'icon': Icons.language_outlined, 'label': lang.isRTL ? 'الموقع' : 'Website', 'value': website, 'action': () => launchUrl(Uri.parse('https://$website'), mode: LaunchMode.externalApplication)},
      {'icon': Icons.access_time_outlined, 'label': lang.isRTL ? 'ساعات العمل' : 'Working Hours', 'value': lang.t('contact.hours')},
    ];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Header
          SliverToBoxAdapter(
            child: MateriaAppBar(
              breadcrumb: [lang.t('nav.home'), lang.t('nav.contact')],
              title: lang.t('contact.title'),
              subtitle: lang.t('contact.subtitle'),
            ),
          ),

          // Contact form + info
          SliverToBoxAdapter(
            child: Container(
              color: AppColors.background,
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Form
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.hairline, width: 1),
                    ),
                    child: _submitted ? _successState(lang) : _buildForm(lang),
                  ),

                  const SizedBox(height: 16),

                  // Contact info cards
                  ...contactInfo.map((info) => Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.hairline, width: 1),
                        ),
                        child: GestureDetector(
                          onTap: () {
                            final action = info['action'] as VoidCallback?;
                            if (action != null) {
                              HapticFeedback.lightImpact();
                              action();
                            }
                          },
                          child: Row(
                            textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceSubtle,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.hairline, width: 0.5),
                                ),
                                child: Icon(info['icon'] as IconData, size: 18, color: AppColors.charcoal800),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      (info['label'] as String).toUpperCase(),
                                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.charcoal400, letterSpacing: 1.2),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      info['value'] as String,
                                      style: AppTheme.body(13, weight: FontWeight.w500, color: AppColors.charcoal800, isRTL: lang.isRTL),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      )),

                  // WhatsApp CTA
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        HapticFeedback.lightImpact();
                        final url = Uri.parse('https://wa.me/$whatsapp');
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url, mode: LaunchMode.externalApplication);
                        }
                      },
                      icon: const Icon(Icons.chat_rounded, size: 18),
                      label: Text(lang.t('contact.whatsapp')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.whatsappGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildForm(LanguageProvider lang) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Text(
            lang.isRTL ? 'أرسل لنا رسالة' : 'Send Us a Message',
            style: AppTheme.heading(20, lang.isRTL),
          ),
          const SizedBox(height: 4),
          Text(
            lang.isRTL ? 'سنرد عليك خلال ٢٤ ساعة' : "We'll respond within 24 hours",
            style: AppTheme.body(13, color: AppColors.charcoal500, isRTL: lang.isRTL),
          ),
          const SizedBox(height: 20),
          // Name + Phone row
          Row(
            children: [
              Expanded(
                child: _field(
                  label: lang.t('contact.name'),
                  hint: lang.isRTL ? 'الاسم الكامل' : 'Your full name',
                  isRTL: lang.isRTL,
                  required: true,
                  onSaved: (v) => _name = v ?? '',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _field(
                  label: lang.t('contact.phone'),
                  hint: lang.isRTL ? 'رقم هاتفك' : '+20 xxx xxx xxxx',
                  isRTL: lang.isRTL,
                  required: true,
                  keyboardType: TextInputType.phone,
                  onSaved: (v) => _phone = v ?? '',
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          _field(
            label: lang.t('contact.email'),
            hint: 'email@company.com',
            isRTL: lang.isRTL,
            required: true,
            keyboardType: TextInputType.emailAddress,
            onSaved: (v) => _email = v ?? '',
          ),
          const SizedBox(height: 14),
          _field(
            label: lang.t('contact.company'),
            hint: lang.isRTL ? 'اسم شركتك' : 'Your company name',
            isRTL: lang.isRTL,
            onSaved: (v) => _company = v ?? '',
          ),
          const SizedBox(height: 14),
          _field(
            label: lang.t('contact.message'),
            hint: lang.isRTL
                ? 'أخبرنا عن مشروعك، نوع الخامة المطلوبة، الكميات...'
                : 'Tell us about your project, required material, quantities...',
            isRTL: lang.isRTL,
            required: true,
            maxLines: 5,
            onSaved: (v) => _message = v ?? '',
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _loading ? null : _submit,
              icon: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.send_rounded, size: 18),
              label: Text(lang.t('contact.send')),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _field({
    required String label,
    required String hint,
    required bool isRTL,
    bool required = false,
    int maxLines = 1,
    TextInputType? keyboardType,
    FormFieldSetter<String>? onSaved,
  }) {
    return Column(
      crossAxisAlignment: isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(
          '$label${required ? ' *' : ''}',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.charcoal700,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          textDirection: isRTL ? TextDirection.rtl : TextDirection.ltr,
          textAlign: isRTL ? TextAlign.right : TextAlign.left,
          maxLines: maxLines,
          keyboardType: keyboardType,
          decoration: InputDecoration(hintText: hint),
          validator: required ? (v) => (v == null || v.isEmpty) ? '' : null : null,
          onSaved: onSaved,
        ),
      ],
    );
  }

  Widget _successState(LanguageProvider lang) {
    return Column(
      children: [
        const SizedBox(height: 40),
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: Colors.green.shade50,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.check_circle_rounded, size: 36, color: Colors.green.shade600),
        ),
        const SizedBox(height: 16),
        Text(
          lang.isRTL ? 'تم الإرسال!' : 'Message Sent!',
          style: AppTheme.heading(20, lang.isRTL),
        ),
        const SizedBox(height: 8),
        Text(
          lang.t('contact.success'),
          style: AppTheme.body(14, color: AppColors.charcoal500, isRTL: lang.isRTL),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: () {
            HapticFeedback.lightImpact();
            setState(() {
              _submitted = false;
              _formKey.currentState?.reset();
            });
          },
          child: Text(lang.isRTL ? 'إرسال رسالة أخرى' : 'Send Another'),
        ),
        const SizedBox(height: 40),
      ],
    );
  }
}
