import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/translations.dart';

class LanguageProvider extends ChangeNotifier {
  String _lang = 'ar';

  String get lang => _lang;
  String get language => _lang;
  bool get isRTL => _lang == 'ar';
  bool get isArabic => _lang == 'ar';
  TextDirection get textDirection => isRTL ? TextDirection.rtl : TextDirection.ltr;
  Locale get locale => Locale(_lang);

  LanguageProvider() {
    _loadLang();
  }

  Future<void> _loadLang() async {
    final prefs = await SharedPreferences.getInstance();
    _lang = prefs.getString('materia-lang') ?? 'ar';
    notifyListeners();
  }

  Future<void> setLang(String newLang) async {
    _lang = newLang;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('materia-lang', newLang);
    notifyListeners();
  }

  void toggleLang() {
    setLang(_lang == 'ar' ? 'en' : 'ar');
  }

  String t(String key) {
    final dict = translations[_lang] ?? {};
    final enDict = translations['en'] ?? {};
    return dict[key] ?? enDict[key] ?? key;
  }
}
