import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'theme/app_theme.dart';

import 'providers/language_provider.dart';
import 'providers/content_provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/splash_screen.dart';
import 'screens/main_shell.dart';
import 'screens/product_detail_screen.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = true;
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MateriaApp());

  // Initialize notifications asynchronously in background to ensure zero delay or crash on startup
  NotificationService.instance.initialize().catchError((e) {
    debugPrint('Notification service background init error: $e');
  });
}

class MateriaApp extends StatelessWidget {
  const MateriaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => ContentProvider()),
      ],
      child: Consumer<LanguageProvider>(
        builder: (context, langProvider, _) {
          return MaterialApp(
            navigatorKey: NotificationService.instance.navigatorKey,
            title: langProvider.isRTL
                ? 'ماتيريا – جلد صناعي فاخر'
                : 'MATERIA – Premium Artificial Leather',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            locale: langProvider.locale,
            supportedLocales: const [Locale('ar'), Locale('en')],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            builder: (context, child) {
              final mediaQuery = MediaQuery.of(context);
              final clampedTextScaler = mediaQuery.textScaler.clamp(
                minScaleFactor: 0.85,
                maxScaleFactor: 1.25,
              );
              return Directionality(
                textDirection: langProvider.textDirection,
                child: MediaQuery(
                  data: mediaQuery.copyWith(textScaler: clampedTextScaler),
                  child: child!,
                ),
              );
            },
            initialRoute: '/',
            onGenerateRoute: (settings) {
              switch (settings.name) {
                case '/':
                  return MaterialPageRoute(
                    builder: (_) => const SplashScreen(),
                  );
                case '/main':
                  final tabIndex = settings.arguments as int? ?? 0;
                  return MaterialPageRoute(
                    builder: (_) => MainShell(initialTab: tabIndex),
                  );
                case '/product':
                  if (settings.arguments is Map) {
                    final args = settings.arguments as Map<String, dynamic>;
                    return MaterialPageRoute(
                      builder: (_) => ProductDetailScreen(
                        slug: args['slug'] as String,
                        initialColorIndex: args['colorIndex'] as int?,
                      ),
                    );
                  }
                  final slug = settings.arguments as String;
                  return MaterialPageRoute(
                    builder: (_) => ProductDetailScreen(slug: slug),
                  );
                default:
                  return MaterialPageRoute(
                    builder: (_) => const MainShell(),
                  );
              }
            },
          );
        },
      ),
    );
  }
}
