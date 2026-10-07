# MATERIA Mobile Application (Flutter)

Premium Artificial Leather Mobile App for MATERIA Egypt.

## Features
- Complete bilingual catalog (Arabic & English) with RTL support
- Material selector, high-res texture zoom, and color tint preview
- Instant Technical Data Sheet (TDS) PDF generation & sharing
- WhatsApp & Direct sample/quote inquiry submission
- **Push Notifications & Deep Linking**:
  - Direct integration with website Admin Dashboard (`/admin/notifications`)
  - Deep linking into product detail screen upon tapping notification
  - Automatic topic subscription (`all_users`) and device token sync

## Push Notifications Setup (Firebase Cloud Messaging)
1. Add `google-services.json` inside `android/app/`.
2. Add `GoogleService-Info.plist` inside `ios/Runner/` (for iOS).
3. Add dependencies in `pubspec.yaml` when ready to build:
   ```yaml
   firebase_core: ^3.6.0
   firebase_messaging: ^15.1.3
   ```
4. Place `firebase_service_account.json` in the web server directory `public/api/` to enable 1-click broadcast from the Admin Dashboard.

