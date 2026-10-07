import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'api_service.dart';
import '../theme/app_colors.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  await Firebase.initializeApp();
  debugPrint("FCM Background Message: ${message.messageId}");
}

/// Central Notification Service for MATERIA Mobile App
/// Handles FCM Token registration, In-App Notification Banners,
/// Topic Subscription, and Deep Linking to Products.
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  bool _initialized = false;

  /// Initializes notification listeners and deep link handler
  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    try {
      // 1. Initialize Firebase
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      final messaging = FirebaseMessaging.instance;

      // 2. Request Notification Permissions (Android 13+ & iOS)
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      debugPrint('FCM Authorization status: ${settings.authorizationStatus}');

      // 3. Subscribe to default broadcast topic for all users (No login required!)
      await messaging.subscribeToTopic('all_users');
      debugPrint('FCM: Subscribed to topic: all_users');

      // 4. Get Device Token and register with Materia backend
      final token = await messaging.getToken();
      if (token != null) {
        debugPrint('FCM Device Token: $token');
        await registerDeviceWithBackend(token);
      }

      // Listen for token refreshes
      messaging.onTokenRefresh.listen((newToken) {
        registerDeviceWithBackend(newToken);
      });

      // 5. Handle notification when app is in foreground
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('FCM Foreground message: ${message.notification?.title}');
        final title = message.notification?.title ?? 'MATERIA';
        final body = message.notification?.body ?? '';
        final slug = message.data['slug'] ?? message.data['product_slug'];
        final image = message.notification?.android?.imageUrl ?? message.data['image_url'];

        showInAppNotification(
          title: title,
          body: body,
          slug: slug?.toString(),
          imageUrl: image?.toString(),
        );
      });

      // 6. Handle notification click when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('FCM Notification tapped from background: ${message.data}');
        handleNotificationPayload(message.data);
      });

      // 7. Check if app was opened from a terminated state via notification click
      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) {
        debugPrint('FCM Initial message found: ${initialMessage.data}');
        // Allow the app UI to build first before navigating
        Future.delayed(const Duration(milliseconds: 600), () {
          handleNotificationPayload(initialMessage.data);
        });
      }

      debugPrint('NotificationService: Fully initialized with Firebase.');
    } catch (e) {
      debugPrint('NotificationService init error (running in fallback mode): $e');
    }
  }

  /// Handles incoming push notification data payload (Deep Linking)
  void handleNotificationPayload(Map<String, dynamic> data) {
    debugPrint('NotificationService payload received: $data');

    final slug = data['slug'] ?? data['product_slug'];
    if (slug != null && slug.toString().trim().isNotEmpty) {
      final cleanSlug = slug.toString().trim();
      debugPrint('NotificationService: Deep-linking to product $cleanSlug');

      // Navigate smoothly to product details
      navigatorKey.currentState?.pushNamed(
        '/product',
        arguments: cleanSlug,
      );
    }
  }

  /// Displays a customized in-app notification banner when message arrives in foreground
  void showInAppNotification({
    required String title,
    required String body,
    String? slug,
    String? imageUrl,
  }) {
    final context = navigatorKey.currentContext;
    if (context == null) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        elevation: 8,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        backgroundColor: AppColors.charcoal900,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        duration: const Duration(seconds: 5),
        content: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.burgundy900,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.notifications_active_rounded,
                color: Colors.white,
                size: 22,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    body,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade300,
                    ),
                  ),
                ],
              ),
            ),
            if (slug != null && slug.isNotEmpty) ...[
              const SizedBox(width: 8),
              TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  navigatorKey.currentState?.pushNamed('/product', arguments: slug);
                },
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.burgundy900,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('عرض', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Registers device token with Materia backend
  Future<void> registerDeviceWithBackend(String token, {String platform = 'android'}) async {
    try {
      final success = await ApiService.registerDeviceToken(token, platform: platform);
      if (success) {
        debugPrint('FCM Token successfully synced with backend API.');
      }
    } catch (e) {
      debugPrint('Error syncing FCM token: $e');
    }
  }
}
