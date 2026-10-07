import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';
import '../providers/content_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/product_card.dart';
import '../widgets/materia_app_bar.dart';
import '../widgets/shimmer_loading.dart';
import 'leather_scanner_screen.dart';

class ProductsScreen extends StatefulWidget {
  final String? initialSearch;
  final String? initialCategory;
  const ProductsScreen({super.key, this.initialSearch, this.initialCategory});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late String _activeFilter;
  late final TextEditingController _searchController;
  final FocusNode _searchFocusNode = FocusNode();
  String _searchQuery = '';

  final List<Map<String, String>> _filters = [
    {'key': 'all', 'en': 'All Materials', 'ar': 'كل الخامات'},
    {'key': 'best_seller', 'en': '★ Best Sellers', 'ar': '★ الأكثر مبيعاً'},
    {'key': 'new', 'en': '✦ New Arrivals', 'ar': '✦ أحدث الخامات'},
    {'key': 'fine-grains', 'en': 'Fine Grains & Plain Papers', 'ar': 'نقشات ناعمة وخامات ملساء'},
    {'key': 'medium-large', 'en': 'Medium & Large Grains', 'ar': 'نقشات متوسطة وكبيرة'},
    {'key': 'textile', 'en': 'Textile & Exotic Grains', 'ar': 'أقمشة وجلود نادرة'},
    {'key': 'furniture', 'en': 'Furniture', 'ar': 'الأثاث'},
    {'key': 'automotive', 'en': 'Automotive', 'ar': 'السيارات'},
    {'key': 'fashion', 'en': 'Fashion', 'ar': 'الموضة'},
    {'key': 'medical', 'en': 'Medical', 'ar': 'الطبي'},
    {'key': 'hospitality', 'en': 'Hospitality', 'ar': 'الضيافة'},
  ];

  @override
  void initState() {
    super.initState();
    _activeFilter = widget.initialCategory ?? 'all';
    _searchQuery = widget.initialSearch ?? '';
    _searchController = TextEditingController(text: _searchQuery);
    _searchFocusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _searchFocusNode.removeListener(_onFocusChange);
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  void _clearSearch() {
    HapticFeedback.lightImpact();
    setState(() {
      _searchController.clear();
      _searchQuery = '';
    });
  }

  void _resetAll() {
    HapticFeedback.lightImpact();
    setState(() {
      _searchController.clear();
      _searchQuery = '';
      _activeFilter = 'all';
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final content = context.watch<ContentProvider>();

    final filtered = content.searchProducts(_searchQuery, category: _activeFilter);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: content.refresh,
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: MateriaAppBar(
                breadcrumb: [lang.t('nav.home'), lang.t('nav.products')],
                title: lang.t('products.title'),
                subtitle: lang.t('products.subtitle'),
                bottomPadding: 16,
              ),
            ),

            // Search Bar Section
            SliverToBoxAdapter(
              child: Container(
                color: AppColors.charcoal950,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.12),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                    border: Border.all(
                      color: _searchFocusNode.hasFocus
                          ? AppColors.primary
                          : AppColors.charcoal300,
                      width: _searchFocusNode.hasFocus ? 1.5 : 1,
                    ),
                  ),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _searchFocusNode,
                    textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                    style: const TextStyle(
                      color: AppColors.charcoal950,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    cursorColor: AppColors.primary,
                    onChanged: (val) {
                      setState(() {
                        _searchQuery = val;
                      });
                    },
                    decoration: InputDecoration(
                      isDense: true,
                      filled: true,
                      fillColor: Colors.white,
                      hintText: lang.t('products.search.placeholder'),
                      hintStyle: const TextStyle(
                        color: AppColors.charcoal400,
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      suffixIcon: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_searchQuery.isNotEmpty)
                            IconButton(
                              icon: const Icon(
                                Icons.close_rounded,
                                color: AppColors.charcoal600,
                                size: 18,
                              ),
                              onPressed: _clearSearch,
                              tooltip: lang.t('products.search.clear'),
                            ),
                          IconButton(
                            icon: const Icon(
                              Icons.document_scanner_outlined,
                              color: AppColors.primary,
                              size: 20,
                            ),
                            tooltip: lang.t('scanner.title'),
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => const LeatherScannerScreen(),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 12,
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Filters Horizontal List
            SliverToBoxAdapter(
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    bottom: BorderSide(color: AppColors.hairline, width: 1),
                  ),
                ),
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      reverse: lang.isRTL,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                        children: _filters.map((f) {
                          final isActive = _activeFilter == f['key'];
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: GestureDetector(
                              onTap: () {
                                HapticFeedback.selectionClick();
                                setState(() => _activeFilter = f['key']!);
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 150),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  color: isActive ? AppColors.charcoal900 : AppColors.surfaceSubtle,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: isActive ? AppColors.charcoal900 : AppColors.hairline,
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  lang.isRTL ? f['ar']! : f['en']!,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                                    color: isActive ? Colors.white : AppColors.charcoal700,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),

                    // Active Search & Filter Count Badge
                    if (_searchQuery.trim().isNotEmpty || _activeFilter != 'all') ...[
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              textDirection: lang.isRTL ? TextDirection.rtl : TextDirection.ltr,
                              children: [
                                Text(
                                  lang.isRTL
                                      ? 'تم العثور على ${filtered.length} خامة'
                                      : 'Found ${filtered.length} materials',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.charcoal600,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                if (_searchQuery.trim().isNotEmpty) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.burgundy50,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      '"$_searchQuery"',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            GestureDetector(
                              onTap: _resetAll,
                              child: Text(
                                lang.isRTL ? 'إعادة الضبط' : 'Reset filters',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // Products with shimmer loading
            if (content.isLoading && filtered.isEmpty)
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) => const Padding(
                      padding: EdgeInsets.only(bottom: 14),
                      child: ProductCardSkeleton(),
                    ),
                    childCount: 4,
                  ),
                ),
              )
            else if (filtered.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: AppColors.surfaceSubtle,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.search_off_rounded,
                            size: 32,
                            color: AppColors.charcoal400,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          _searchQuery.isNotEmpty
                              ? (lang.isRTL
                                  ? 'لم نجد خامات مطابقة لـ "$_searchQuery"'
                                  : 'No materials match "$_searchQuery"')
                              : (lang.isRTL
                                  ? 'لا توجد منتجات في هذا التصنيف'
                                  : 'No products in this category'),
                          textAlign: TextAlign.center,
                          style: AppTheme.body(14, color: AppColors.charcoal700, isRTL: lang.isRTL).copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          lang.isRTL
                              ? 'جرب البحث باسم آخر أو كود أو مادة مختلفة'
                              : 'Try searching with another name, code, or material',
                          textAlign: TextAlign.center,
                          style: AppTheme.body(12, color: AppColors.charcoal400, isRTL: lang.isRTL),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: _resetAll,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                          ),
                          icon: const Icon(Icons.refresh_rounded, size: 16),
                          label: Text(
                            lang.isRTL ? 'عرض كل الخامات' : 'View All Materials',
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, i) => Padding(
                      padding: EdgeInsets.only(bottom: 14),
                      child: ProductCard(product: filtered[i]),
                    ),
                    childCount: filtered.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
