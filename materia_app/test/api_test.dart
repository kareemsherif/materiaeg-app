import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:materia_app/services/api_service.dart';
import 'package:materia_app/providers/content_provider.dart';
import 'package:materia_app/models/models.dart';

Product _createTestProduct({
  required String id,
  required bool isBestSeller,
  required bool isNew,
}) {
  return Product(
    id: id,
    slug: 'slug-$id',
    name: const Translation(en: 'Test', ar: 'تجربة'),
    code: 'MT-$id',
    description: const Translation(en: '', ar: ''),
    thickness: '1.2mm',
    width: '140cm',
    materialType: const Translation(en: 'PVC', ar: 'PVC'),
    texture: const Translation(en: '', ar: ''),
    backing: const Translation(en: '', ar: ''),
    finish: const Translation(en: '', ar: ''),
    waterResistance: const Translation(en: '', ar: ''),
    fireResistance: const Translation(en: '', ar: ''),
    softnessLevel: const Translation(en: '', ar: ''),
    isBestSeller: isBestSeller,
    isNew: isNew,
    image: 'assets/test.jpg',
    galleryImages: const [],
    colors: const [],
    applications: const [],
    categories: const [],
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  SharedPreferences.setMockInitialValues({});

  test('ApiService parses data with fallback', () async {
    final response = await ApiService.fetchData();
    expect(response.products, isNotEmpty);
    expect(response.settings, isNotEmpty);
  });

  test('ContentProvider loads products and allows category filtering', () async {
    final provider = ContentProvider();
    await provider.loadData();
    expect(provider.products, isNotEmpty);
    expect(provider.featuredProducts, isNotEmpty);

    // Verify first products are Best Sellers or New
    final firstProduct = provider.products.first;
    expect(firstProduct.isBestSeller || firstProduct.isNew, isTrue);

    final allProducts = provider.getProductsByCategory('all');
    expect(allProducts.length, provider.products.length);

    final bestSellers = provider.getProductsByCategory('best_seller');
    expect(bestSellers.every((p) => p.isBestSeller), isTrue);

    final newArrivals = provider.getProductsByCategory('new');
    expect(newArrivals.every((p) => p.isNew), isTrue);
  });

  test('sortProductsByPriority correctly orders best sellers and new products first', () {
    final pRegular = _createTestProduct(id: '1', isBestSeller: false, isNew: false);
    final pNew = _createTestProduct(id: '2', isBestSeller: false, isNew: true);
    final pBest = _createTestProduct(id: '3', isBestSeller: true, isNew: false);
    final pBoth = _createTestProduct(id: '4', isBestSeller: true, isNew: true);

    final sorted = ContentProvider.sortProductsByPriority([pRegular, pNew, pBest, pBoth]);
    expect(sorted.map((p) => p.id).toList(), ['4', '3', '2', '1']);
  });
}
