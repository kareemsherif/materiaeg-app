import 'dart:ui' as ui;
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('All assets decode cleanly without error', () async {
    final assetPaths = [
      'assets/images/hero.jpg',
      'assets/images/factory.jpg',
      'assets/images/logo.png',
      'assets/images/emblem.png',
      'assets/images/products/soft-touch.jpg',
      'assets/images/products/ultra-grip.jpg',
      'assets/images/products/auto-grade.jpg',
      'assets/images/products/fashion-black.jpg',
      'assets/images/products/medica.jpg',
      'assets/images/applications/sofa.jpg',
      'assets/images/applications/chair.jpg',
      'assets/images/applications/car.jpg',
      'assets/images/applications/bag.jpg',
      'assets/images/applications/shoes.jpg',
      'assets/images/applications/hotel.jpg',
      'assets/images/applications/medical.jpg',
      'assets/images/applications/wall.jpg',
    ];

    for (final path in assetPaths) {
      try {
        final data = await rootBundle.load(path);
        expect(data.lengthInBytes, greaterThan(0));
        final codec = await ui.instantiateImageCodec(data.buffer.asUint8List());
        final frame = await codec.getNextFrame();
        expect(frame.image.width, greaterThan(0));
        expect(frame.image.height, greaterThan(0));
      } catch (e) {
        fail('Asset failed to decode: $path -> $e');
      }
    }
  });
}
