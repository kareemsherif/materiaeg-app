import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/models.dart';
import '../providers/language_provider.dart';
import '../providers/content_provider.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import 'product_detail_screen.dart';

class LeatherScannerScreen extends StatefulWidget {
  final bool isStandaloneTab;

  const LeatherScannerScreen({
    super.key,
    this.isStandaloneTab = false,
  });

  @override
  State<LeatherScannerScreen> createState() => _LeatherScannerScreenState();
}

class _LeatherScannerScreenState extends State<LeatherScannerScreen>
    with SingleTickerProviderStateMixin {
  final ImagePicker _picker = ImagePicker();
  Uint8List? _selectedImageBytes;
  bool _isAnalyzing = false;
  LeatherScanResult? _result;
  String? _errorMessage;

  late AnimationController _scannerAnimCtrl;
  late Animation<double> _scannerPosition;

  @override
  void initState() {
    super.initState();
    _scannerAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    );
    _scannerPosition = Tween<double>(begin: 0.05, end: 0.95).animate(
      CurvedAnimation(parent: _scannerAnimCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _scannerAnimCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final langCode = context.read<LanguageProvider>().lang;
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 88,
      );

      if (file == null) return;

      final bytes = await file.readAsBytes();
      if (!mounted) return;

      setState(() {
        _selectedImageBytes = bytes;
        _isAnalyzing = true;
        _errorMessage = null;
        _result = null;
      });

      _scannerAnimCtrl.repeat(reverse: true);
      HapticFeedback.mediumImpact();

      final currentCatalog = context.read<ContentProvider>().products;
      final scanResult = await ApiService.matchLeather(
        imageBytes: bytes,
        lang: langCode,
        currentCatalog: currentCatalog,
      );

      if (!mounted) return;

      _scannerAnimCtrl.stop();
      setState(() {
        _isAnalyzing = false;
        if (scanResult != null && scanResult.success) {
          _result = scanResult;
        } else {
          _errorMessage = scanResult?.error ??
              (langCode == 'ar'
                  ? 'تعذر تحليل عينة الجلد. يُرجى التحقق من اتصال الإنترنت والتقاط صورة أوضح.'
                  : 'Unable to analyze leather sample. Please check internet connection and take a clearer photo.');
        }
      });
      HapticFeedback.lightImpact();
    } catch (e) {
      if (!mounted) return;
      _scannerAnimCtrl.stop();
      setState(() {
        _isAnalyzing = false;
        _errorMessage = e.toString();
      });
    }
  }

  void _resetScanner() {
    setState(() {
      _selectedImageBytes = null;
      _isAnalyzing = false;
      _result = null;
      _errorMessage = null;
    });
    _scannerAnimCtrl.reset();
  }

  void _openWhatsAppSample(Product product, int score, String langCode) async {
    const phone = '201099996025';
    final name = product.name.get(langCode);
    final code = product.code;
    final text = langCode == 'ar'
        ? 'مرحباً ماتيريا، قمت بفحص عينة جلد عبر الماسح الذكي وظهرت لي الخامة المطابقة: $name ($code) بنسبة تطابق $score%. أود الاستفسار وطلب عينة فعلية لمشروعي.'
        : 'Hello MATERIA, I scanned a leather sample via the AI Scanner and got a matching material: $name ($code) with $score% match. I would like to request an actual sample.';

    final uri = Uri.parse('https://wa.me/$phone?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final isAr = lang.isRTL;
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          lang.t('scanner.title'),
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,
        leading: widget.isStandaloneTab
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 19),
                onPressed: () => Navigator.of(context).maybePop(),
              ),
        actions: [
          if (_selectedImageBytes != null)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              tooltip: lang.t('scanner.retake'),
              onPressed: _resetScanner,
            ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: EdgeInsets.symmetric(
            horizontal: screenWidth < 360 ? 12 : 16,
            vertical: 14,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Top Hero Badge & Subtitle
              _buildTopHero(lang, isAr),
              const SizedBox(height: 16),

              // Viewfinder / Captured image
              _buildScanViewfinder(lang, isAr, screenWidth),
              const SizedBox(height: 20),

              // Error notification if present
              if (_errorMessage != null) _buildErrorCard(),

              // Analysis Results & Matched Products
              if (_result != null && !_isAnalyzing) ...[
                _buildAnalysisResultCard(lang, isAr, _result!.analysis),
                const SizedBox(height: 22),
                _buildMatchesSection(lang, isAr, _result!.matches),
                const SizedBox(height: 22),
                _buildRescanButton(lang),
                const SizedBox(height: 32),
              ],

              // Empty initial state: Grain reference guide
              if (_selectedImageBytes == null && !_isAnalyzing) ...[
                _buildGrainGuide(lang, isAr),
                const SizedBox(height: 24),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopHero(LanguageProvider lang, bool isAr) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: AppColors.burgundy50,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: AppColors.burgundy200),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.auto_awesome, size: 14, color: AppColors.logoBurgundy),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  isAr ? 'التعرف البصري بالذكاء الاصطناعي' : 'AI OPTICAL RECOGNITION',
                  style: const TextStyle(
                    color: AppColors.logoBurgundy,
                    fontWeight: FontWeight.w700,
                    fontSize: 10.5,
                    letterSpacing: 0.3,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          lang.t('scanner.subtitle'),
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 13,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  Widget _buildScanViewfinder(LanguageProvider lang, bool isAr, double screenWidth) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: _isAnalyzing ? AppColors.logoBurgundy : AppColors.cardBorder,
          width: _isAnalyzing ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: _selectedImageBytes == null
          ? _buildEmptyViewfinder(lang, isAr, screenWidth)
          : _buildCapturedPreview(lang, isAr),
    );
  }

  Widget _buildEmptyViewfinder(LanguageProvider lang, bool isAr, double screenWidth) {
    final isVeryCompact = screenWidth < 350;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.burgundy50,
              border: Border.all(color: AppColors.burgundy200, width: 1.5),
            ),
            child: const Icon(
              Icons.document_scanner_outlined,
              size: 38,
              color: AppColors.logoBurgundy,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            isAr ? 'وجّه الكاميرا نحو عينة الجلد' : 'Point Camera at Leather Sample',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              lang.t('scanner.cameraTip'),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11.5,
                color: AppColors.textLight,
                height: 1.4,
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Action buttons: Stack vertically on very compact screens, side-by-side on standard screens
          if (isVeryCompact) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _pickImage(ImageSource.camera),
                icon: const Icon(Icons.camera_alt_rounded, size: 17, color: Colors.white),
                label: Text(
                  lang.t('scanner.takePhoto'),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.logoBurgundy,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _pickImage(ImageSource.gallery),
                icon: const Icon(Icons.photo_library_outlined, size: 17, color: AppColors.logoBurgundy),
                label: Text(
                  lang.t('scanner.chooseGallery'),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.logoBurgundy),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.burgundy200),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ] else ...[
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt_rounded, size: 17, color: Colors.white),
                    label: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        lang.t('scanner.takePhoto'),
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.logoBurgundy,
                      padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      elevation: 0,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library_outlined, size: 17, color: AppColors.logoBurgundy),
                    label: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        lang.t('scanner.chooseGallery'),
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.logoBurgundy),
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.burgundy200),
                      padding: const EdgeInsets.symmetric(vertical: 13, horizontal: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCapturedPreview(LanguageProvider lang, bool isAr) {
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          height: 290,
          width: double.infinity,
          child: Image.memory(
            _selectedImageBytes!,
            fit: BoxFit.cover,
          ),
        ),
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          height: 80,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.7),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),

        // Animated laser line
        if (_isAnalyzing)
          AnimatedBuilder(
            animation: _scannerAnimCtrl,
            builder: (context, child) {
              return Positioned(
                top: _scannerPosition.value * 270,
                left: 0,
                right: 0,
                child: Column(
                  children: [
                    Container(
                      height: 3,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Colors.transparent,
                            AppColors.logoBurgundy,
                            Colors.white,
                            AppColors.logoBurgundy,
                            Colors.transparent,
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.logoBurgundy.withValues(alpha: 0.8),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

        // Analyzing prompt
        if (_isAnalyzing)
          Positioned(
            bottom: 16,
            left: 14,
            right: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white12),
              ),
              child: Row(
                children: [
                  const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          lang.t('scanner.analyzing'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 12.5,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          lang.t('scanner.analyzingTip'),
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.75),
                            fontSize: 10.5,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

        // Retake button on top corner
        if (!_isAnalyzing)
          Positioned(
            top: 12,
            right: isAr ? null : 12,
            left: isAr ? 12 : null,
            child: Material(
              color: Colors.black.withValues(alpha: 0.65),
              borderRadius: BorderRadius.circular(24),
              child: InkWell(
                onTap: () => _pickImage(ImageSource.camera),
                borderRadius: BorderRadius.circular(24),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 15),
                      const SizedBox(width: 5),
                      Text(
                        isAr ? 'إعادة التصوير' : 'Retake',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildErrorCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFCA5A5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline, color: Color(0xFFDC2626), size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _errorMessage!,
              style: const TextStyle(
                color: Color(0xFF991B1B),
                fontSize: 12.5,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnalysisResultCard(
      LanguageProvider lang, bool isAr, LeatherAnalysis analysis) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with responsive title and confidence badge
          Row(
            children: [
              const Icon(Icons.insights_rounded, color: AppColors.logoBurgundy, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  lang.t('scanner.resultTitle'),
                  style: const TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Text(
                  '${analysis.confidence}% ${isAr ? "دقة" : "confidence"}',
                  style: const TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF065F46),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Main Category Title Box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.burgundy50,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.burgundy100),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isAr ? 'الفئة المكتشفة بالذكاء الاصطناعي:' : 'Detected AI Family:',
                  style: const TextStyle(
                    fontSize: 10.5,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  analysis.category.get(lang.lang),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.logoBurgundy,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Technical Specs: Responsive vertical row layout with zero overflow
          _buildSpecRow(
            icon: Icons.grain,
            label: lang.t('scanner.grain'),
            value: analysis.grainPattern.get(lang.lang),
          ),
          const SizedBox(height: 8),
          _buildSpecRow(
            icon: Icons.wb_sunny_outlined,
            label: lang.t('scanner.sheen'),
            value: analysis.sheen,
          ),
          const SizedBox(height: 8),
          _buildSpecRow(
            icon: Icons.straighten,
            label: lang.t('scanner.thickness'),
            value: analysis.estimatedThickness,
          ),
          const SizedBox(height: 8),
          _buildSpecRow(
            icon: Icons.layers_outlined,
            label: lang.t('scanner.backing'),
            value: analysis.backingGuess,
          ),
          const SizedBox(height: 14),

          // Summary explanation
          if (analysis.summary.get(lang.lang).isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceSubtle,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Text(
                analysis.summary.get(lang.lang),
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Recommended applications
          Text(
            lang.t('scanner.recommendedUses'),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: (isAr ? analysis.recommendedUsesAr : analysis.recommendedUses)
                .map(
                  (u) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.cream100,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.cream300),
                    ),
                    child: Text(
                      u,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.charcoal700,
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: AppColors.logoBurgundy),
          const SizedBox(width: 8),
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 11.5,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMatchesSection(
      LanguageProvider lang, bool isAr, List<LeatherMatchItem> matches) {
    if (matches.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 3.5,
              height: 16,
              decoration: BoxDecoration(
                color: AppColors.logoBurgundy,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                lang.t('scanner.matchesTitle'),
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Text(
              '${matches.length} ${isAr ? "خامات" : "items"}',
              style: const TextStyle(
                fontSize: 11.5,
                color: AppColors.textLight,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: matches.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final match = matches[index];
            return _buildMatchItemCard(lang, isAr, match);
          },
        ),
      ],
    );
  }

  Widget _buildMatchItemCard(
      LanguageProvider lang, bool isAr, LeatherMatchItem match) {
    final p = match.product;
    final name = p.name.get(lang.lang);
    final reason = match.matchReason.get(lang.lang);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(13),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(9),
                child: SizedBox(
                  width: 68,
                  height: 68,
                  child: p.image.startsWith('assets/')
                      ? Image.asset(p.image, fit: BoxFit.cover)
                      : Image.network(
                          p.image.startsWith('http')
                              ? p.image
                              : '${ApiService.baseUrl}/${p.image.replaceFirst(RegExp(r'^/'), '')}',
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AppColors.cream200,
                            child: const Icon(Icons.image_not_supported, size: 22, color: AppColors.charcoal400),
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            name,
                            style: const TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                          decoration: BoxDecoration(
                            color: match.matchScore >= 90
                                ? const Color(0xFFECFDF5)
                                : const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: match.matchScore >= 90
                                  ? const Color(0xFFA7F3D0)
                                  : const Color(0xFFFDE68A),
                            ),
                          ),
                          child: Text(
                            '${match.matchScore}% ${lang.t('scanner.matchScore')}',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: match.matchScore >= 90
                                  ? const Color(0xFF065F46)
                                  : const Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${lang.t('product.code')}: ${p.code}',
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textLight,
                        fontWeight: FontWeight.w500,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (p.thickness.isNotEmpty) ...[
                      const SizedBox(height: 1),
                      Text(
                        '${lang.t('product.thickness')}: ${p.thickness}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Match Reason Box: Expanded soft-wrapping text
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: AppColors.surfaceSubtle,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              reason,
              style: const TextStyle(
                fontSize: 11.5,
                color: AppColors.textSecondary,
                height: 1.35,
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Responsive Actions: Clean vertical layout eliminates all horizontal button overflows!
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ProductDetailScreen(slug: p.slug.isNotEmpty ? p.slug : p.id),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.burgundy200),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 9),
                  ),
                  child: Text(
                    lang.t('scanner.viewProduct'),
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.logoBurgundy,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _openWhatsAppSample(p, match.matchScore, lang.lang),
                  icon: const Icon(Icons.chat_bubble_outline, size: 13, color: Colors.white),
                  label: Text(
                    lang.t('scanner.requestSample'),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.whatsappGreen,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 6),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRescanButton(LanguageProvider lang) {
    return ElevatedButton.icon(
      onPressed: _resetScanner,
      icon: const Icon(Icons.refresh_rounded, size: 18, color: Colors.white),
      label: Text(
        lang.t('scanner.retake'),
        style: const TextStyle(
          fontSize: 13.5,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.logoBurgundy,
        padding: const EdgeInsets.symmetric(vertical: 13),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      ),
    );
  }

  Widget _buildGrainGuide(LanguageProvider lang, bool isAr) {
    final categories = [
      {
        'title': isAr ? 'ناعم وأملس (Smooth / Nappa)' : 'Smooth / Nappa',
        'desc': isAr ? 'سطح فاخر أملس، مسام دقيقة وملمس حريري' : 'Ultra-fine grain, silky soft touch',
        'icon': Icons.fiber_manual_record_outlined,
      },
      {
        'title': isAr ? 'حبيبات دقيقة (Fine Grain / Pebble)' : 'Fine Grain / Pebble',
        'desc': isAr ? 'حبيبات منتظمة وبارزة خفيفة كلاسيكية لتنجيد السيارات' : 'Uniform pebble grain, classic automotive upholstery',
        'icon': Icons.grain,
      },
      {
        'title': isAr ? 'نقشة متقاطعة (Cross-Hatch / Saffiano)' : 'Cross-Hatch / Saffiano',
        'desc': isAr ? 'خطوط قطرية متقاطعة مقاومة للخدش للحقائب الفاخرة' : 'Diagonal cross-hatch texture, scratch resistant',
        'icon': Icons.grid_4x4,
      },
      {
        'title': isAr ? 'ألياف كربون (Carbon Fiber)' : 'Carbon Fiber',
        'desc': isAr ? 'نسيج ثلاثي الأبعاد هندسي يمنح طابعاً رياضياً' : 'High-tech weave structure for sport & luxury',
        'icon': Icons.crop_square,
      },
      {
        'title': isAr ? 'شمواه ونوبوك (Suede / Nubuck)' : 'Suede / Nubuck',
        'desc': isAr ? 'ملمس مخملي مطفي بالكامل يمنح دفئاً ونعومة فائقة' : 'Velvety matte napped texture with zero sheen',
        'icon': Icons.texture,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.category_outlined, size: 17, color: AppColors.logoBurgundy),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                isAr ? 'دليل أنماط ونقشات جلود ماتيريا' : 'Materia Leather Grain Reference',
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ...categories.map(
          (c) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: AppColors.burgundy50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(c['icon'] as IconData, size: 18, color: AppColors.logoBurgundy),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        c['title'] as String,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        c['desc'] as String,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
