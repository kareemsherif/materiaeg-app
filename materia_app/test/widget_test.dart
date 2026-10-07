// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:materia_app/main.dart';
import 'package:materia_app/screens/home_screen.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MateriaApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 1600));
    await tester.pump(const Duration(milliseconds: 500));

    // Verify Materia app boots correctly
    expect(find.byType(MateriaApp), findsOneWidget);

    final homeScreenFinder = find.byType(HomeScreen);
    expect(homeScreenFinder, findsOneWidget);
    final homeSize = tester.getSize(homeScreenFinder);
    expect(homeSize.height, greaterThan(500.0));

    // Dispose the app cleanly so provider timers are cancelled
    await tester.pumpWidget(const SizedBox());
  });
}
