import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/models.dart';
import '../providers/language_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import 'colorized_product_image.dart';

class ProductCard extends StatefulWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  int? _selectedColorIndex;

  Color _parseHex(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  void _navigateToDetail() {
    HapticFeedback.lightImpact();
    Navigator.pushNamed(
      context,
      '/product',
      arguments: {
        'slug': widget.product.slug,
        'colorIndex': _selectedColorIndex,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final name = widget.product.name.get(lang.lang);
    final selectedColorItem = _selectedColorIndex != null &&
            _selectedColorIndex! < widget.product.colors.length
        ? widget.product.colors[_selectedColorIndex!]
        : null;

    final selectedColor = selectedColorItem != null
        ? _parseHex(selectedColorItem.hex)
        : null;

    // Resolve target image based on selected color:
    // 1. Color-specific image if present on the color object
    // 2. Or if product has gallery images, map selected color to gallery image
    // 3. Fallback to default product.image
    String displayedImage = widget.product.image;
    bool hasDistinctImage = false;
    final colorImg = selectedColorItem?.image;
    if (colorImg != null && colorImg.isNotEmpty) {
      displayedImage = colorImg;
      hasDistinctImage = true;
    } else if (_selectedColorIndex != null && widget.product.galleryImages.isNotEmpty) {
      if (widget.product.galleryImages.length > 1) {
        displayedImage = widget.product.galleryImages[_selectedColorIndex! % widget.product.galleryImages.length];
        hasDistinctImage = true;
      }
    }

    return GestureDetector(
      onTap: _navigateToDetail,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.hairline, width: 1),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with clean transition affecting only the product image
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(11),
                    ),
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      switchInCurve: Curves.easeInOut,
                      switchOutCurve: Curves.easeInOut,
                      child: ColorizedProductImage(
                        key: ValueKey(
                          '${displayedImage}_${hasDistinctImage ? "img" : (selectedColor?.toARGB32() ?? 0)}',
                        ),
                        imagePath: displayedImage,
                        color: hasDistinctImage ? null : selectedColor,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  // Badges
                  Positioned(
                    top: 8,
                    left: lang.isRTL ? null : 8,
                    right: lang.isRTL ? 8 : null,
                    child: Column(
                      crossAxisAlignment: lang.isRTL
                          ? CrossAxisAlignment.end
                          : CrossAxisAlignment.start,
                      children: [
                        if (widget.product.isBestSeller)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color:
                                  AppColors.charcoal900.withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              lang.t('products.bestSeller').toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.6,
                              ),
                            ),
                          ),
                        if (widget.product.isNew) ...[
                          if (widget.product.isBestSeller)
                            const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.9),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              lang.t('products.new').toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
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

            // Content
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: lang.isRTL
                    ? CrossAxisAlignment.end
                    : CrossAxisAlignment.start,
                children: [
                  // Material Name
                  Text(
                    name,
                    style: AppTheme.body(14,
                        weight: FontWeight.w600,
                        color: AppColors.charcoal900,
                        isRTL: lang.isRTL),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  // Material Code
                  Text(
                    widget.product.code,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.charcoal400,
                      letterSpacing: 0.8,
                    ),
                  ),

                  // Color selection circles placed under material name
                  if (widget.product.colors.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    _buildColorSelector(lang),
                  ],

                  const SizedBox(height: 10),

                  // Specs
                  Wrap(
                    spacing: 4,
                    runSpacing: 4,
                    textDirection:
                        lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                    children: [
                      _specChip(widget.product.thickness),
                      _specChip(widget.product.width),
                      _specChip(widget.product.materialType.get(lang.lang)),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // CTA
                  Row(
                    textDirection:
                        lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                    children: [
                      Text(
                        lang.t('products.viewApplications'),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.charcoal800,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        lang.isRTL
                            ? Icons.arrow_back_ios_new_rounded
                            : Icons.arrow_forward_ios_rounded,
                        size: 10,
                        color: AppColors.charcoal800,
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

  Widget _buildColorSelector(LanguageProvider lang) {
    return Column(
      crossAxisAlignment:
          lang.isRTL ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        // Circles row
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
            mainAxisSize: MainAxisSize.min,
            children: List.generate(widget.product.colors.length, (i) {
              final colorItem = widget.product.colors[i];
              final colorVal = _parseHex(colorItem.hex);
              final isSelected = _selectedColorIndex == i;

              return Padding(
                padding: EdgeInsets.only(
                  left: lang.isRTL ? 6 : 0,
                  right: lang.isRTL ? 0 : 6,
                ),
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                    onTap: () {
                      HapticFeedback.selectionClick();
                    setState(() {
                      // Toggle color selection or switch color
                      if (_selectedColorIndex == i) {
                        _selectedColorIndex = null;
                      } else {
                        _selectedColorIndex = i;
                      }
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    curve: Curves.easeOut,
                    width: 24,
                    height: 24,
                    padding: const EdgeInsets.all(2.5),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected
                            ? AppColors.charcoal900
                            : Colors.transparent,
                        width: isSelected ? 1.5 : 1.0,
                      ),
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        color: colorVal,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.black.withValues(alpha: 0.12),
                          width: 0.8,
                        ),
                      ),
                      child: isSelected
                          ? Icon(
                              Icons.check,
                              size: 11,
                              color: colorVal.computeLuminance() > 0.5
                                  ? AppColors.charcoal900
                                  : Colors.white,
                            )
                          : null,
                    ),
                  ),
                ),
              );
            }),
          ),
        ),

        // Selected color name feedback
        const SizedBox(height: 4),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 150),
          child: Text(
            _selectedColorIndex != null
                ? widget.product.colors[_selectedColorIndex!].name
                    .get(lang.lang)
                : (lang.isRTL
                    ? '${widget.product.colors.length} ألوان متوفرة (اضغط للتجربة)'
                    : '${widget.product.colors.length} colors (tap to preview)'),
            key: ValueKey(_selectedColorIndex),
            style: TextStyle(
              fontSize: 10,
              fontWeight: _selectedColorIndex != null
                  ? FontWeight.w600
                  : FontWeight.w400,
              color: _selectedColorIndex != null
                  ? AppColors.charcoal800
                  : AppColors.charcoal400,
            ),
          ),
        ),
      ],
    );
  }

  Widget _specChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: AppColors.hairline, width: 0.5),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: AppColors.charcoal600,
        ),
      ),
    );
  }
}
