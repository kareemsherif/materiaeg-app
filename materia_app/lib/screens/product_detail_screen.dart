import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';
import '../providers/language_provider.dart';
import '../providers/content_provider.dart';
import '../services/pdf_service.dart';
import '../services/api_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../data/app_data.dart' as data;
import '../models/models.dart';
import '../widgets/colorized_product_image.dart';
import '../widgets/app_image.dart';

class ProductDetailScreen extends StatefulWidget {
  final String slug;
  final int? initialColorIndex;

  const ProductDetailScreen({
    super.key,
    required this.slug,
    this.initialColorIndex,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _activeImg = 0;
  late int? _activeColor = widget.initialColorIndex;
  bool _pdfLoading = false;

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final content = context.watch<ContentProvider>();
    final product = content.getProductBySlug(widget.slug) ?? data.products.first;
    final gallery = product.galleryImages.isNotEmpty ? product.galleryImages : [product.image];
    final activeImgIndex = _activeImg < gallery.length ? _activeImg : 0;

    final selectedColorItem = _activeColor != null && _activeColor! < product.colors.length
        ? product.colors[_activeColor!]
        : null;

    final hasDistinctImage = (selectedColorItem?.image != null && selectedColorItem!.image!.isNotEmpty) || gallery.length > 1;

    final activeColorValue = (!hasDistinctImage && selectedColorItem != null)
        ? _parseHex(selectedColorItem.hex)
        : null;

    final allProducts = content.products.isNotEmpty ? content.products : data.products;

    // Filter products from the same category
    final sameCategoryProducts = allProducts.where((p) {
      if (p.id == product.id || p.slug == product.slug) return false;
      if (product.categories.isNotEmpty) {
        return p.categories.any((c) =>
            product.categories.any((pc) => pc.trim().toLowerCase() == c.trim().toLowerCase()));
      }
      return p.materialType.get('en').toLowerCase() == product.materialType.get('en').toLowerCase();
    }).toList();

    // Fallback if needed so section is not empty
    final relatedProducts = [
      ...sameCategoryProducts,
      ...allProducts.where((p) =>
          p.id != product.id &&
          p.slug != product.slug &&
          !sameCategoryProducts.any((sc) => sc.id == p.id)),
    ].take(3).toList();

    final specRows = [
      {'label': lang.t('product.code'), 'value': product.code},
      {'label': lang.t('product.thickness'), 'value': product.thickness},
      {'label': lang.t('product.width'), 'value': product.width},
      {'label': lang.t('product.length'), 'value': '50 m / roll'},
      {'label': lang.t('product.material'), 'value': product.materialType.get(lang.lang)},
      {'label': lang.t('product.texture'), 'value': product.texture.get(lang.lang)},
      {'label': lang.t('product.backing'), 'value': product.backing.get(lang.lang)},
      {'label': lang.t('product.finish'), 'value': product.finish.get(lang.lang)},
      {'label': lang.t('product.water'), 'value': product.waterResistance.get(lang.lang)},
      {'label': lang.t('product.softness'), 'value': product.softnessLevel.get(lang.lang)},
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // App bar with dynamically colorized hero image
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            backgroundColor: Colors.white,
            foregroundColor: AppColors.charcoal700,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  ColorizedProductImage(
                    imagePath: gallery[activeImgIndex],
                    color: activeColorValue,
                    fit: BoxFit.cover,
                  ),
                  // Badges
                  if (product.isNew || product.isBestSeller)
                    Positioned(
                      top: MediaQuery.of(context).padding.top + 48,
                      left: lang.isRTL ? null : 16,
                      right: lang.isRTL ? 16 : null,
                      child: Column(
                        crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                        children: [
                          if (product.isBestSeller)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.charcoal900.withValues(alpha: 0.85),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                lang.t('products.bestSeller').toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.6,
                                ),
                              ),
                            ),
                          if (product.isNew) ...[
                            if (product.isBestSeller) const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.9),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                lang.t('products.new').toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.6,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Thumbnails
          SliverToBoxAdapter(
            child: SizedBox(
              height: 64,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: gallery.length,
                itemBuilder: (context, i) {
                  final isSelected = _activeImg == i;
                  return GestureDetector(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() => _activeImg = i);
                    },
                    child: Container(
                      width: 56,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? AppColors.charcoal900 : AppColors.hairline,
                          width: isSelected ? 1.5 : 1.0,
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(7),
                        child: ColorizedProductImage(
                          imagePath: gallery[i],
                          color: activeColorValue,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          // Product Info
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  // Material Name
                  Text(
                    product.name.get(lang.lang),
                    style: AppTheme.heading(26, lang.isRTL),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                    children: [
                      Expanded(
                        child: Text(
                          product.name.get(lang.isRTL ? 'en' : 'ar'),
                          style: AppTheme.body(14, color: AppColors.charcoal500, isRTL: !lang.isRTL),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceSubtle,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppColors.hairline, width: 0.5),
                        ),
                        child: Text(
                          product.code,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.charcoal700,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Colors Selector PLACED DIRECTLY UNDER MATERIAL NAME
                  if (product.colors.isNotEmpty) ...[
                    const SizedBox(height: 18),
                    _buildColorSelector(product, lang),
                  ],

                  const SizedBox(height: 20),

                  // Description
                  Text(
                    product.description.get(lang.lang),
                    style: AppTheme.body(14, color: AppColors.charcoal600, isRTL: lang.isRTL),
                    textAlign: lang.isRTL ? TextAlign.right : TextAlign.left,
                  ),
                  const SizedBox(height: 20),

                  // Specs
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSubtle,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.hairline, width: 1),
                    ),
                    child: Column(
                      children: specRows.map((row) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: AppColors.hairline,
                                width: row == specRows.last ? 0 : 0.8,
                              ),
                            ),
                          ),
                          child: Row(
                            textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                row['label']!,
                                style: AppTheme.body(12, color: AppColors.charcoal500, weight: FontWeight.w400, isRTL: lang.isRTL),
                              ),
                              const SizedBox(width: 8),
                              Flexible(
                                child: Text(
                                  row['value']!,
                                  style: AppTheme.body(12, color: AppColors.charcoal900, weight: FontWeight.w600, isRTL: lang.isRTL),
                                  textAlign: lang.isRTL ? TextAlign.left : TextAlign.right,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // CTAs
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _showQuoteBottomSheet(context, product, lang),
                      icon: const Icon(Icons.inventory_2_outlined, size: 16),
                      label: Text(lang.t('product.requestQuote')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.charcoal950,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _pdfLoading ? null : () => _downloadPdf(product, lang),
                          icon: _pdfLoading
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.charcoal500),
                                )
                              : const Icon(Icons.download_outlined, size: 16),
                          label: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(lang.t('product.downloadPdf'), style: const TextStyle(fontSize: 12)),
                          ),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: const BorderSide(color: AppColors.charcoal300),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => Navigator.pushReplacementNamed(context, '/main', arguments: 4),
                          icon: const Icon(Icons.phone_outlined, size: 16),
                          label: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(lang.t('product.requestSample'), style: const TextStyle(fontSize: 12)),
                          ),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            side: const BorderSide(color: AppColors.charcoal300),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final phone = content.settings['whatsapp'] ?? data.settings['whatsapp'] ?? '201000000000';
                        final msg = Uri.encodeComponent('Hello, I\'m interested in ${product.code} - ${product.name.en}');
                        final url = Uri.parse('https://wa.me/$phone?text=$msg');
                        if (await canLaunchUrl(url)) {
                          await launchUrl(url, mode: LaunchMode.externalApplication);
                        }
                      },
                      icon: const Icon(Icons.chat_rounded, size: 16),
                      label: Text(lang.t('product.whatsapp')),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.whatsappGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Related Products
          if (relatedProducts.isNotEmpty)
            SliverToBoxAdapter(
              child: Container(
                color: AppColors.background,
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.isRTL ? 'منتجات ذات صلة' : 'Related Materials',
                      style: AppTheme.heading(20, lang.isRTL),
                    ),
                    const SizedBox(height: 16),
                    ...relatedProducts.map((p) => _relatedCard(p, lang)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildColorSelector(Product product, LanguageProvider lang) {
    final gallery = product.galleryImages.isNotEmpty ? product.galleryImages : [product.image];

    return Column(
      crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Row(
          textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              lang.t('product.colors').toUpperCase(),
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.charcoal500,
                letterSpacing: 1.5,
              ),
            ),
            if (_activeColor != null && _activeColor! < product.colors.length)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.hairline),
                ),
                child: Text(
                  product.colors[_activeColor!].name.get(lang.lang),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.charcoal900,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
          children: List.generate(product.colors.length, (i) {
            final color = product.colors[i];
            final colorValue = _parseHex(color.hex);
            final isActive = _activeColor == i;
            final lum = colorValue.computeLuminance();

            return GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                setState(() {
                  if (isActive) {
                    _activeColor = null;
                  } else {
                    _activeColor = i;
                    if (color.image != null && color.image!.isNotEmpty) {
                      final idx = gallery.indexOf(color.image!);
                      if (idx != -1) {
                        _activeImg = idx;
                      }
                    } else if (gallery.length > 1) {
                      _activeImg = i % gallery.length;
                    }
                  }
                });
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: 36,
                height: 36,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isActive ? AppColors.charcoal950 : AppColors.hairline,
                    width: isActive ? 2.0 : 1.0,
                  ),
                  boxShadow: [
                    if (isActive)
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                  ],
                ),
                child: Container(
                  decoration: BoxDecoration(
                    color: colorValue,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.black.withValues(alpha: 0.1),
                      width: 0.8,
                    ),
                  ),
                  child: isActive
                      ? Icon(
                          Icons.check,
                          color: lum > 0.5 ? AppColors.charcoal900 : Colors.white,
                          size: 16,
                        )
                      : null,
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _relatedCard(Product p, LanguageProvider lang) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/product', arguments: p.slug),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.hairline, width: 1),
        ),
        child: Row(
          textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: AppImage(imagePath: p.image, width: 60, height: 60, fit: BoxFit.cover),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  Text(
                    p.name.get(lang.lang),
                    style: AppTheme.body(14, weight: FontWeight.w600, color: AppColors.charcoal900, isRTL: lang.isRTL),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(p.code, style: const TextStyle(fontSize: 10, color: AppColors.charcoal400, letterSpacing: 0.5)),
                  const SizedBox(height: 4),
                  Row(
                    textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        lang.t('products.viewApplications'),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.charcoal900),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        lang.isRTL ? Icons.arrow_back_ios_new_rounded : Icons.arrow_forward_ios_rounded,
                        size: 10,
                        color: AppColors.charcoal900,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ──────────────────────────────────────────
  //  PDF Direct Download — saves directly to device storage
  // ──────────────────────────────────────────
  Future<void> _downloadPdf(Product product, LanguageProvider lang) async {
    setState(() => _pdfLoading = true);
    HapticFeedback.mediumImpact();

    try {
      final pdfBytes = await PdfService.generateProductPdf(product);
      final cleanCode = product.code.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
      final cleanName = product.name.en.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
      final fileName = 'MATERIA_${cleanCode}_$cleanName.pdf';

      Directory? targetDir;

      // 1. Try public Download folder on Android
      if (Platform.isAndroid) {
        final publicDownload = Directory('/storage/emulated/0/Download');
        if (publicDownload.existsSync()) {
          targetDir = publicDownload;
        } else {
          try {
            final extDirs = await getExternalStorageDirectories(type: StorageDirectory.downloads);
            if (extDirs != null && extDirs.isNotEmpty) {
              targetDir = extDirs.first;
            }
          } catch (_) {}
        }
      }

      // 2. Try standard Downloads directory
      if (targetDir == null) {
        try {
          targetDir = await getDownloadsDirectory();
        } catch (_) {}
      }

      // 3. Fallback to App Documents
      targetDir ??= await getApplicationDocumentsDirectory();

      final filePath = '${targetDir.path}/$fileName';
      final file = File(filePath);
      await file.writeAsBytes(pdfBytes, flush: true);

      if (mounted) {
        HapticFeedback.heavyImpact();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              lang.isRTL
                  ? 'تم تنزيل ملف المواصفات بنجاح في مجلد التنزيلات'
                  : 'Specifications PDF downloaded successfully to Downloads',
            ),
            backgroundColor: AppColors.charcoal950,
            duration: const Duration(seconds: 4),
            action: SnackBarAction(
              label: lang.isRTL ? 'فتح' : 'Open',
              textColor: Colors.white,
              onPressed: () => OpenFilex.open(filePath),
            ),
          ),
        );

        // Open the downloaded PDF directly for the user
        await OpenFilex.open(filePath);
      }
    } catch (e) {
      debugPrint('PDF download error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(lang.isRTL ? 'حدث خطأ أثناء تنزيل الملف' : 'Error downloading PDF'),
            backgroundColor: Colors.red.shade600,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _pdfLoading = false);
    }
  }

  // ──────────────────────────────────────────
  //  Quote Request Bottom Sheet — matches the website's modal
  // ──────────────────────────────────────────
  void _showQuoteBottomSheet(BuildContext context, Product product, LanguageProvider lang) {
    HapticFeedback.mediumImpact();
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final qtyCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        bool loading = false;
        bool sent = false;

        return Directionality(
          textDirection: lang.textDirection,
          child: StatefulBuilder(
            builder: (ctx, setSheetState) {
              return Container(
                margin: const EdgeInsets.only(top: 60),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                child: Padding(
                  padding: EdgeInsets.only(
                    left: 20,
                    right: 20,
                    top: 16,
                    bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
                  ),
                  child: sent
                      // ── SUCCESS STATE ──
                      ? Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const SizedBox(height: 32),
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
                              lang.isRTL ? 'تم إرسال طلبك بنجاح!' : 'Quote Request Sent!',
                              style: AppTheme.heading(20, lang.isRTL),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              lang.t('contact.success'),
                              style: AppTheme.body(14, color: AppColors.charcoal500, isRTL: lang.isRTL),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 20),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: Text(lang.isRTL ? 'إغلاق' : 'Close'),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                        )
                      // ── FORM STATE ──
                      : SingleChildScrollView(
                          child: Form(
                            key: formKey,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Drag handle
                                Center(
                                  child: Container(
                                    width: 40,
                                    height: 4,
                                    decoration: BoxDecoration(
                                      color: AppColors.charcoal200,
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),

                                // Header
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            lang.t('product.requestQuote'),
                                            style: AppTheme.heading(20, lang.isRTL),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${product.code} – ${product.name.get(lang.lang)}',
                                            style: AppTheme.body(12, color: AppColors.charcoal500, isRTL: lang.isRTL),
                                          ),
                                        ],
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () => Navigator.pop(ctx),
                                      child: Container(
                                        padding: const EdgeInsets.all(6),
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceSubtle,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: AppColors.hairline),
                                        ),
                                        child: const Icon(Icons.close, size: 18, color: AppColors.charcoal500),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 20),

                                // Full Name
                                _quoteField(
                                  label: lang.isRTL ? 'الاسم بالكامل *' : 'Full Name *',
                                  hint: lang.isRTL ? 'اسمك أو اسم الشركة' : 'Your name or company',
                                  controller: nameCtrl,
                                  isRTL: lang.isRTL,
                                  required: true,
                                ),
                                const SizedBox(height: 12),

                                // Phone + Quantity row
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: _quoteField(
                                        label: lang.isRTL ? 'رقم الهاتف *' : 'Phone *',
                                        hint: '+20 xxx xxx xxxx',
                                        controller: phoneCtrl,
                                        isRTL: lang.isRTL,
                                        required: true,
                                        keyboardType: TextInputType.phone,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: _quoteField(
                                        label: lang.isRTL ? 'الكمية التقديرية' : 'Quantity',
                                        hint: lang.isRTL ? '50 متر أو 2 رول' : 'e.g. 50 meters',
                                        controller: qtyCtrl,
                                        isRTL: lang.isRTL,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),

                                // Email
                                _quoteField(
                                  label: lang.isRTL ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)',
                                  hint: 'name@company.com',
                                  controller: emailCtrl,
                                  isRTL: lang.isRTL,
                                  keyboardType: TextInputType.emailAddress,
                                ),
                                const SizedBox(height: 12),

                                // Notes
                                _quoteField(
                                  label: lang.isRTL ? 'ملاحظات إضافية' : 'Additional Notes',
                                  hint: lang.isRTL ? 'تفاصيل اللون أو الاستخدام...' : 'Color preferences or application details...',
                                  controller: notesCtrl,
                                  isRTL: lang.isRTL,
                                  maxLines: 3,
                                ),
                                const SizedBox(height: 20),

                                // Buttons
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: () => Navigator.pop(ctx),
                                        style: OutlinedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(vertical: 14),
                                          side: const BorderSide(color: AppColors.charcoal300),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                        child: Text(lang.isRTL ? 'إلغاء' : 'Cancel'),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: ElevatedButton(
                                        onPressed: loading
                                            ? null
                                            : () async {
                                                if (!formKey.currentState!.validate()) return;
                                                HapticFeedback.heavyImpact();
                                                setSheetState(() => loading = true);

                                                final success = await ApiService.submitQuoteRequest(
                                                  name: nameCtrl.text.trim(),
                                                  phone: phoneCtrl.text.trim(),
                                                  email: emailCtrl.text.trim(),
                                                  quantity: qtyCtrl.text.trim(),
                                                  notes: notesCtrl.text.trim(),
                                                  productCode: product.code,
                                                  productName: product.name.en,
                                                  productThickness: product.thickness,
                                                  productWidth: product.width,
                                                );

                                                setSheetState(() {
                                                  loading = false;
                                                  if (success) { sent = true; }
                                                });
                                              },
                                        style: ElevatedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(vertical: 14),
                                          backgroundColor: AppColors.charcoal950,
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          elevation: 0,
                                        ),
                                        child: loading
                                            ? const SizedBox(
                                                width: 18,
                                                height: 18,
                                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                              )
                                            : Text(lang.isRTL ? 'تأكيد الطلب' : 'Submit Request'),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _quoteField({
    required String label,
    required String hint,
    required TextEditingController controller,
    required bool isRTL,
    bool required = false,
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.charcoal700,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          textDirection: (keyboardType == TextInputType.phone || keyboardType == TextInputType.emailAddress)
              ? TextDirection.ltr
              : (isRTL ? TextDirection.rtl : TextDirection.ltr),
          textAlign: (keyboardType == TextInputType.phone || keyboardType == TextInputType.emailAddress)
              ? (isRTL ? TextAlign.right : TextAlign.left)
              : (isRTL ? TextAlign.right : TextAlign.left),
          maxLines: maxLines,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            hintTextDirection: isRTL ? TextDirection.rtl : TextDirection.ltr,
          ),
          validator: required
              ? (v) => (v == null || v.trim().isEmpty)
                  ? (isRTL ? 'هذا الحقل مطلوب' : 'This field is required')
                  : null
              : null,
        ),
      ],
    );
  }



  Color _parseHex(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }
}
