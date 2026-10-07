import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:materia_app/models/models.dart';
import 'package:materia_app/providers/language_provider.dart';
import 'package:materia_app/widgets/product_card.dart';
import 'package:materia_app/widgets/colorized_product_image.dart';

void main() {
  testWidgets('ProductCard renders color circles under name and updates image on tap',
      (tester) async {
    const testProduct = Product(
      id: 'test-1',
      slug: 'test-leather',
      name: Translation(en: 'Test Leather', ar: 'جلد تجريبي'),
      code: 'TL-01',
      description: Translation(en: 'Description', ar: 'وصف'),
      thickness: '1.2 mm',
      width: '140 cm',
      materialType: Translation(en: 'PVC', ar: 'PVC'),
      texture: Translation(en: 'Smooth', ar: 'ناعم'),
      backing: Translation(en: 'Fabric', ar: 'قماش'),
      finish: Translation(en: 'Matte', ar: 'مطفأ'),
      waterResistance: Translation(en: 'High', ar: 'عالي'),
      fireResistance: Translation(en: 'Standard', ar: 'قياسي'),
      softnessLevel: Translation(en: 'Medium', ar: 'متوسط'),
      isNew: true,
      isBestSeller: true,
      image: 'assets/images/products/soft-touch.jpg',
      galleryImages: ['assets/images/products/soft-touch.jpg'],
      colors: [
        ProductColor(name: Translation(en: 'Red', ar: 'أحمر'), hex: '#FF0000'),
        ProductColor(name: Translation(en: 'Blue', ar: 'أزرق'), hex: '#0000FF'),
      ],
      applications: ['sofa'],
      categories: ['furniture'],
    );

    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => LanguageProvider(),
        child: const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: ProductCard(product: testProduct),
            ),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Verify product name is rendered in default Arabic
    expect(find.text('جلد تجريبي'), findsOneWidget);
    expect(find.text('TL-01'), findsOneWidget);

    // Verify initial ColorizedProductImage has null color (original photo)
    final initialImageFinder = find.byType(ColorizedProductImage);
    expect(initialImageFinder, findsOneWidget);
    ColorizedProductImage imgWidget = tester.widget(initialImageFinder);
    expect(imgWidget.color, isNull);

    // Verify the color circles are rendered (2 color swatches)
    // Find GestureDetector inside the color selector
    // Tap the first color circle (Red: #FF0000)
    final redCircleFinder = find.byWidgetPredicate((widget) {
      if (widget is Container &&
          widget.decoration is BoxDecoration &&
          (widget.decoration as BoxDecoration).color == const Color(0xFFFF0000)) {
        return true;
      }
      return false;
    });
    expect(redCircleFinder, findsOneWidget);

    await tester.ensureVisible(redCircleFinder);
    await tester.tap(redCircleFinder);
    await tester.pumpAndSettle();

    // After tapping Red, ColorizedProductImage must now have the red color!
    imgWidget = tester.widget(find.byType(ColorizedProductImage));
    expect(imgWidget.color, equals(const Color(0xFFFF0000)));
    // Also the text label for Red should now appear
    expect(find.text('أحمر'), findsOneWidget);

    // Now tap the blue circle (#0000FF)
    final blueCircleFinder = find.byWidgetPredicate((widget) {
      if (widget is Container &&
          widget.decoration is BoxDecoration &&
          (widget.decoration as BoxDecoration).color == const Color(0xFF0000FF)) {
        return true;
      }
      return false;
    });
    expect(blueCircleFinder, findsOneWidget);

    await tester.ensureVisible(blueCircleFinder);
    await tester.tap(blueCircleFinder);
    await tester.pumpAndSettle();

    // Image color should now be Blue!
    imgWidget = tester.widget(find.byType(ColorizedProductImage));
    expect(imgWidget.color, equals(const Color(0xFF0000FF)));
    expect(find.text('أزرق'), findsOneWidget);
  });
}
