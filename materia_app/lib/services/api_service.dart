import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';
import '../data/app_data.dart' as fallback_data;

class ApiResponse {
  final List<Product> products;
  final Map<String, String> settings;
  final Map<String, dynamic> translations;
  final bool isFromNetwork;
  final String? error;

  const ApiResponse({
    required this.products,
    required this.settings,
    required this.translations,
    this.isFromNetwork = false,
    this.error,
  });
}

class ApiService {
  static const String baseUrl = 'https://materiaeg.com';
  static const String getDataUrl = '$baseUrl/api/get_data.php';
  static const String cacheKey = 'materia_cached_api_data';

  /// Fetches latest live data from website API with offline fallback
  static Future<ApiResponse> fetchData() async {
    // 1. Try to fetch from live API with cache busting so additions reflect immediately
    try {
      final uri = Uri.parse(
          '$getDataUrl?t=${DateTime.now().millisecondsSinceEpoch}');
      final response = await http.get(
        uri,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes));
        if (decoded is Map<String, dynamic>) {
          // Persist to local cache so freshly added website products stay available offline
          _saveToCache(response.body);

          return _parseApiData(decoded, isFromNetwork: true);
        }
      } else {
        debugPrint('ApiService HTTP ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('ApiService live fetch error: $e');
    }

    // 2. Try loading from cache
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedJson = prefs.getString(cacheKey);
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final decoded = json.decode(cachedJson);
        if (decoded is Map<String, dynamic>) {
          return _parseApiData(decoded, isFromNetwork: false);
        }
      }
    } catch (e) {
      debugPrint('ApiService cache read error: $e');
    }

    // 3. Fallback to embedded local data
    return ApiResponse(
      products: fallback_data.products,
      settings: fallback_data.settings,
      translations: {},
      isFromNetwork: false,
    );
  }

  static ApiResponse _parseApiData(Map<String, dynamic> json,
      {required bool isFromNetwork}) {
    final productsList = <Product>[];
    if (json['products'] is List) {
      for (final p in json['products']) {
        if (p is Map<String, dynamic>) {
          try {
            productsList.add(Product.fromJson(p));
          } catch (e) {
            debugPrint('Error parsing product: $e');
          }
        } else if (p is Map) {
          try {
            productsList.add(Product.fromJson(Map<String, dynamic>.from(p)));
          } catch (e) {
            debugPrint('Error parsing product map: $e');
          }
        }
      }
    }

    final settingsMap = Map<String, String>.from(fallback_data.settings);
    if (json['settings'] is Map) {
      final s = json['settings'] as Map;
      s.forEach((k, v) {
        if (v != null) settingsMap[k.toString()] = v.toString();
      });
    }

    final translationsMap = <String, dynamic>{};
    if (json['translations'] is Map) {
      translationsMap.addAll(Map<String, dynamic>.from(json['translations']));
    }

    return ApiResponse(
      products: productsList.isNotEmpty ? productsList : fallback_data.products,
      settings: settingsMap,
      translations: translationsMap,
      isFromNetwork: isFromNetwork,
    );
  }

  static Future<void> _saveToCache(String rawJson) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(cacheKey, rawJson);
    } catch (e) {
      debugPrint('Failed to save to cache: $e');
    }
  }

  /// Submit contact message
  static Future<bool> submitContactMessage({
    required String name,
    required String phone,
    required String email,
    required String company,
    required String message,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/api/send_message.php');
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'phone': phone,
          'email': email,
          'company': company,
          'message': message,
          'type': 'mobile_app_contact',
        }),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        return true;
      }
      debugPrint('submitContactMessage status: ${res.statusCode}');
      return false;
    } catch (e) {
      debugPrint('Contact submit error: $e');
      return false;
    }
  }

  /// Submit a quote request for a specific product (matches website modal)
  static Future<bool> submitQuoteRequest({
    required String name,
    required String phone,
    String email = '',
    String quantity = '',
    String notes = '',
    required String productCode,
    required String productName,
    String productThickness = '',
    String productWidth = '',
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/api/send_message.php');
      final message = 'Product: $productName ($productCode)\n'
          'Thickness: $productThickness\n'
          'Width: $productWidth\n'
          'Quantity: ${quantity.isNotEmpty ? quantity : "Not specified"}\n'
          'Notes: ${notes.isNotEmpty ? notes : "None"}';

      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'phone': phone,
          'email': email,
          'subject': 'Quote Request: $productCode - $productName',
          'message': message,
          'type': 'quote',
        }),
      ).timeout(const Duration(seconds: 10));

      if (res.statusCode == 200) {
        return true;
      }
      debugPrint('submitQuoteRequest status: ${res.statusCode}');
      return false;
    } catch (e) {
      debugPrint('Quote submit error: $e');
      return false;
    }
  }

  /// Registers FCM device token with the backend API
  static Future<bool> registerDeviceToken(String token, {String platform = 'android'}) async {
    try {
      final uri = Uri.parse('$baseUrl/api/register_device.php');
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'token': token,
          'platform': platform,
        }),
      ).timeout(const Duration(seconds: 10));
      return res.statusCode == 200;
    } catch (e) {
      debugPrint('Device token registration error: $e');
      return false;
    }
  }


  /// Analyzes a leather photo with AI Vision and matches it with the Materia catalog.
  ///
  /// SECURITY: The Gemini API key must NEVER be embedded in the mobile app
  /// (it can be extracted from the APK/IPA). All AI calls go through the
  /// backend endpoint `match_leather.php`, which keeps the key server-side.
  static Future<LeatherScanResult?> matchLeather({
    required List<int> imageBytes,
    String lang = 'ar',
    List<Product>? currentCatalog,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/api/match_leather.php');
      final base64Image = base64Encode(imageBytes);

      final Map<String, dynamic> bodyMap = {
        'image_base64': base64Image,
        'lang': lang,
      };

      if (currentCatalog != null && currentCatalog.isNotEmpty) {
        bodyMap['catalog'] = currentCatalog.map((p) => {
          'id': p.id,
          'code': p.code,
          'slug': p.slug,
          'name_en': p.name.en,
          'name_ar': p.name.ar,
          'texture_en': p.texture.en,
          'texture_ar': p.texture.ar,
          'material_type_en': p.materialType.en,
          'material_type_ar': p.materialType.ar,
          'finish_en': p.finish.en,
          'finish_ar': p.finish.ar,
          'thickness': p.thickness,
          'image': p.image,
          'colors': p.colors.map((c) => {
            'name': {'en': c.name.en, 'ar': c.name.ar},
            'hex': c.hex,
          }).toList(),
          'categories': p.categories,
        }).toList();
      }

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode(bodyMap),
      ).timeout(const Duration(seconds: 60));

      if (response.statusCode == 200) {
        final decoded = json.decode(utf8.decode(response.bodyBytes));
        if (decoded is Map<String, dynamic>) {
          return LeatherScanResult.fromJson(decoded);
        }
      } else {
        debugPrint('matchLeather HTTP ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Backend matchLeather error: $e');
    }

    return null;
  }
}