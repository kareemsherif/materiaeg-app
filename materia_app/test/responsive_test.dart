import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:materia_app/providers/language_provider.dart';
import 'package:materia_app/providers/content_provider.dart';
import 'package:materia_app/screens/main_shell.dart';
import 'package:materia_app/screens/product_detail_screen.dart';
import 'package:materia_app/data/app_data.dart' as data;

void main() {
  final testDevices = <String, Size>{
    'iPhone_SE_1st_gen (320x568)': const Size(320, 568),
    'iPhone_SE_2nd_gen (375x667)': const Size(375, 667),
    'Modern_Phone (390x844)': const Size(390, 844),
    'Pro_Max_Ultra (430x932)': const Size(430, 932),
    'Tablet_Foldable (768x1024)': const Size(768, 1024),
  };

  for (final entry in testDevices.entries) {
    testWidgets('MainShell renders without overflow on ${entry.key}', (tester) async {
      tester.view.physicalSize = entry.value;
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => LanguageProvider()),
            ChangeNotifierProvider(create: (_) => ContentProvider()),
          ],
          child: const MaterialApp(
            home: MainShell(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 600));

      // Expect no RenderFlex overflows
      expect(tester.takeException(), isNull);
    });

    testWidgets('ProductDetailScreen renders without overflow on ${entry.key}', (tester) async {
      tester.view.physicalSize = entry.value;
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => LanguageProvider()),
            ChangeNotifierProvider(create: (_) => ContentProvider()),
          ],
          child: MaterialApp(
            home: ProductDetailScreen(slug: data.products.first.slug),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Expect no RenderFlex overflows
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('Renders properly under large accessibility font scaling (1.35x)', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => LanguageProvider()),
          ChangeNotifierProvider(create: (_) => ContentProvider()),
        ],
        child: MaterialApp(
          builder: (context, child) {
            final mediaQuery = MediaQuery.of(context);
            return MediaQuery(
              data: mediaQuery.copyWith(
                textScaler: const TextScaler.linear(1.35).clamp(
                  minScaleFactor: 0.85,
                  maxScaleFactor: 1.25,
                ),
              ),
              child: child!,
            );
          },
          home: const MainShell(),
        ),
      ),
    );

    await tester.pump();
    await tester.pump(const Duration(milliseconds: 600));
    expect(tester.takeException(), isNull);
  });
}
