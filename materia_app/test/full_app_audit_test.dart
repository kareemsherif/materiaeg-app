import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:materia_app/main.dart';
import 'package:materia_app/screens/main_shell.dart';
import 'package:materia_app/screens/home_screen.dart';
import 'package:materia_app/screens/products_screen.dart';
import 'package:materia_app/screens/industries_screen.dart';
import 'package:materia_app/screens/leather_scanner_screen.dart';
import 'package:materia_app/screens/contact_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Full App Audit: boots and renders all screens without errors', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    await tester.pumpWidget(const MateriaApp());
    await tester.pump();
    // Advance past SplashScreen (1500ms)
    await tester.pump(const Duration(milliseconds: 1600));
    await tester.pump(const Duration(milliseconds: 500));

    // Verify MainShell is now showing
    expect(find.byType(MainShell), findsOneWidget);
    expect(find.byType(HomeScreen), findsOneWidget);

    // Verify HomeScreen elements
    expect(find.text('MATERIA'), findsAtLeastNWidgets(1));

    // Pump enough time for FadeSlideIn delayed animations
    await tester.pump(const Duration(milliseconds: 800));

    // Verify Tab switching
    // Tab 1: Products
    await tester.tap(find.byIcon(Icons.grid_view_outlined));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.byType(ProductsScreen), findsOneWidget);

    // Tab 2: Scanner
    await tester.tap(find.byIcon(Icons.document_scanner_outlined).last);
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.byType(LeatherScannerScreen), findsOneWidget);

    // Tab 3: Industries
    await tester.tap(find.byIcon(Icons.factory_outlined));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.byType(IndustriesScreen), findsOneWidget);

    // Tab 4: Contact
    await tester.tap(find.byIcon(Icons.mail_outline_rounded));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.byType(ContactScreen), findsOneWidget);

    // Switch back to Home
    await tester.tap(find.byIcon(Icons.home_outlined));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.byType(HomeScreen), findsOneWidget);

    // Check no exceptions occurred
    expect(tester.takeException(), isNull);
  });
}
