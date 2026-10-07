import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../data/app_data.dart' as fallback_data;

class ContentProvider extends ChangeNotifier {
  List<Product> _products = sortProductsByPriority(fallback_data.products);
  Map<String, String> _settings = fallback_data.settings;
  bool _isLoading = false;
  bool _isRefreshing = false;
  bool _isFromNetwork = false;
  String? _error;
  Timer? _syncTimer;

  List<Product> get products => _products;
  Map<String, String> get settings => _settings;
  bool get isLoading => _isLoading;
  bool get isRefreshing => _isRefreshing;
  bool get isFromNetwork => _isFromNetwork;
  String? get error => _error;

  /// Sorts products placing Best Sellers and New products at the top
  static List<Product> sortProductsByPriority(List<Product> list) {
    final bestSellerAndNew = <Product>[];
    final bestSellers = <Product>[];
    final newProducts = <Product>[];
    final others = <Product>[];

    for (final p in list) {
      if (p.isBestSeller && p.isNew) {
        bestSellerAndNew.add(p);
      } else if (p.isBestSeller) {
        bestSellers.add(p);
      } else if (p.isNew) {
        newProducts.add(p);
      } else {
        others.add(p);
      }
    }

    return [...bestSellerAndNew, ...bestSellers, ...newProducts, ...others];
  }

  ContentProvider() {
    loadData();
    // Auto-sync every 10 minutes to conserve battery, data, and prevent server load
    _syncTimer = Timer.periodic(const Duration(minutes: 10), (_) {
      silentSync();
    });
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    super.dispose();
  }

  Future<void> loadData() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.fetchData();
      _products = sortProductsByPriority(response.products);
      _settings = response.settings;
      _isFromNetwork = response.isFromNetwork;
      _error = response.error;
    } catch (e) {
      _error = e.toString();
      debugPrint('ContentProvider loadData error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    _isRefreshing = true;
    notifyListeners();

    try {
      final response = await ApiService.fetchData();
      _products = sortProductsByPriority(response.products);
      _settings = response.settings;
      _isFromNetwork = response.isFromNetwork;
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isRefreshing = false;
      notifyListeners();
    }
  }

  /// Silently checks for server updates in background without full screen spinner
  Future<void> silentSync() async {
    try {
      final response = await ApiService.fetchData();
      if (response.isFromNetwork) {
        final incomingSorted = sortProductsByPriority(response.products);
        bool hasChanges = _products.length != incomingSorted.length;
        if (!hasChanges) {
          // Check if any product ID or code differs
          for (int i = 0; i < _products.length; i++) {
            if (_products[i].id != incomingSorted[i].id ||
                _products[i].code != incomingSorted[i].code ||
                _products[i].image != incomingSorted[i].image ||
                _products[i].isBestSeller != incomingSorted[i].isBestSeller ||
                _products[i].isNew != incomingSorted[i].isNew) {
              hasChanges = true;
              break;
            }
          }
        }

        if (hasChanges) {
          _products = incomingSorted;
          _settings = response.settings;
          _isFromNetwork = true;
          _error = null;
          notifyListeners();
          debugPrint('ContentProvider: Auto-synced ${incomingSorted.length} products from website');
        }
      }
    } catch (e) {
      debugPrint('Silent sync error: $e');
    }
  }

  Product? getProductBySlug(String slug) {
    try {
      return _products.firstWhere((p) => p.slug == slug || p.id == slug);
    } catch (_) {
      try {
        return fallback_data.products.firstWhere((p) => p.slug == slug || p.id == slug);
      } catch (_) {
        return null;
      }
    }
  }

  List<Product> get featuredProducts {
    final list = _products.where((p) => p.isBestSeller || p.isNew).toList();
    if (list.isNotEmpty) return list;
    return _products.take(6).toList();
  }

  List<Product> get newArrivals {
    final list = _products.where((p) => p.isNew).toList();
    if (list.isNotEmpty) return list;
    return _products.take(4).toList();
  }

  List<Product> getProductsByCategory(String category) {
    if (category == 'all' || category.isEmpty) {
      return _products;
    }
    if (category == 'best_seller' || category == 'bestseller' || category == 'best-seller') {
      return _products.where((p) => p.isBestSeller).toList();
    }
    if (category == 'new' || category == 'new_arrivals' || category == 'new-arrivals') {
      return _products.where((p) => p.isNew).toList();
    }

    final catClean = category.toLowerCase().replaceAll('_', '-');

    if (catClean == 'fine-grains') {
      return _products.where((p) {
        final hasCat = p.categories.any((c) {
          final cClean = c.toLowerCase().replaceAll('_', '-');
          return cClean == 'fine-grains' || cClean.contains('fine-grain');
        });
        if (hasCat) return true;
        final t = '${p.name.ar} ${p.name.en} ${p.texture.ar} ${p.texture.en} ${p.description.ar} ${p.description.en}'.toLowerCase();
        return t.contains('ملساء') ||
            t.contains('ناعمة') ||
            t.contains('ناعم') ||
            t.contains('smooth') ||
            t.contains('soft touch') ||
            t.contains('سوفت تاتش') ||
            t.contains('plain');
      }).toList();
    }

    if (catClean == 'medium-large') {
      return _products.where((p) {
        final hasCat = p.categories.any((c) {
          final cClean = c.toLowerCase().replaceAll('_', '-');
          return cClean == 'medium-large' || cClean.contains('medium-large');
        });
        if (hasCat) return true;
        final t = '${p.name.ar} ${p.name.en} ${p.texture.ar} ${p.texture.en} ${p.description.ar} ${p.description.en}'.toLowerCase();
        return t.contains('متوسط') ||
            t.contains('كبير') ||
            t.contains('medium') ||
            t.contains('large') ||
            t.contains('ultra grip') ||
            t.contains('ألترا جريب') ||
            t.contains('auto grade') ||
            t.contains('أوتو جريد') ||
            t.contains('perforated') ||
            t.contains('مثقب') ||
            t.contains('embossed');
      }).toList();
    }

    if (catClean == 'textile' || catClean == 'exotic') {
      return _products.where((p) {
        final hasCat = p.categories.any((c) {
          final cClean = c.toLowerCase().replaceAll('_', '-');
          return cClean == 'textile' || cClean.contains('textile') || cClean.contains('exotic');
        });
        if (hasCat) return true;
        final t = '${p.name.ar} ${p.name.en} ${p.texture.ar} ${p.texture.en} ${p.description.ar} ${p.description.en} ${p.backing.ar} ${p.backing.en}'.toLowerCase();
        return t.contains('أقمشة') ||
            t.contains('قماش') ||
            t.contains('نادرة') ||
            t.contains('textile') ||
            t.contains('exotic') ||
            t.contains('woven') ||
            t.contains('منسوج') ||
            t.contains('محبوك') ||
            t.contains('نسيج') ||
            t.contains('daedalus') ||
            t.contains('hamada');
      }).toList();
    }

    return _products.where((p) {
      final inCats = p.categories.any((c) => c.toLowerCase().replaceAll('_', '-').contains(catClean));
      final inApps = p.applications.any((a) => a.toLowerCase().replaceAll('_', '-').contains(catClean));
      return inCats || inApps;
    }).toList();
  }

  /// Search products by query across name, code, textures, applications, colors, etc.
  List<Product> searchProducts(String query, {String category = 'all'}) {
    final pool = getProductsByCategory(category);
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return pool;

    return pool.where((p) {
      final nameEn = p.name.en.toLowerCase();
      final nameAr = p.name.ar.toLowerCase();
      final code = p.code.toLowerCase();
      final descEn = p.description.en.toLowerCase();
      final descAr = p.description.ar.toLowerCase();
      final matEn = p.materialType.en.toLowerCase();
      final matAr = p.materialType.ar.toLowerCase();
      final texEn = p.texture.en.toLowerCase();
      final texAr = p.texture.ar.toLowerCase();
      final backEn = p.backing.en.toLowerCase();
      final backAr = p.backing.ar.toLowerCase();
      final apps = p.applications.join(' ').toLowerCase();
      final cats = p.categories.join(' ').toLowerCase();
      final colors = p.colors
          .map((c) => '${c.name.en} ${c.name.ar}')
          .join(' ')
          .toLowerCase();

      return nameEn.contains(q) ||
          nameAr.contains(q) ||
          code.contains(q) ||
          descEn.contains(q) ||
          descAr.contains(q) ||
          matEn.contains(q) ||
          matAr.contains(q) ||
          texEn.contains(q) ||
          texAr.contains(q) ||
          backEn.contains(q) ||
          backAr.contains(q) ||
          apps.contains(q) ||
          cats.contains(q) ||
          colors.contains(q);
    }).toList();
  }
}
