class Translation {
  final String en;
  final String ar;

  const Translation({required this.en, required this.ar});

  String get(String lang) => lang == 'ar' ? ar : en;

  factory Translation.fromJson(dynamic json, {String defaultEn = '', String defaultAr = ''}) {
    if (json == null) return Translation(en: defaultEn, ar: defaultAr);
    if (json is String) return Translation(en: json, ar: json);
    if (json is Map) {
      return Translation(
        en: json['en']?.toString() ?? defaultEn,
        ar: json['ar']?.toString() ?? defaultAr,
      );
    }
    return Translation(en: defaultEn, ar: defaultAr);
  }

  Map<String, dynamic> toJson() => {'en': en, 'ar': ar};
}

class ProductColor {
  final Translation name;
  final String hex;
  final String? image;

  const ProductColor({required this.name, required this.hex, this.image});

  factory ProductColor.fromJson(Map<String, dynamic> json) {
    return ProductColor(
      name: Translation.fromJson(json['name'], defaultEn: 'Color', defaultAr: 'لون'),
      hex: json['hex']?.toString() ?? '#56001A',
      image: json['image']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name.toJson(),
    'hex': hex,
    if (image != null) 'image': image,
  };
}

class Product {
  final String id;
  final String slug;
  final Translation name;
  final String code;
  final Translation description;
  final String thickness;
  final String width;
  final Translation materialType;
  final Translation texture;
  final Translation backing;
  final Translation finish;
  final Translation waterResistance;
  final Translation fireResistance;
  final Translation softnessLevel;
  final bool isNew;
  final bool isBestSeller;
  final String image;
  final List<String> galleryImages;
  final List<ProductColor> colors;
  final List<String> applications;
  final List<String> categories;

  const Product({
    required this.id,
    required this.slug,
    required this.name,
    required this.code,
    required this.description,
    required this.thickness,
    required this.width,
    required this.materialType,
    required this.texture,
    required this.backing,
    required this.finish,
    required this.waterResistance,
    required this.fireResistance,
    required this.softnessLevel,
    this.isNew = false,
    this.isBestSeller = false,
    required this.image,
    required this.galleryImages,
    required this.colors,
    required this.applications,
    required this.categories,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Parse colors
    final colorsList = <ProductColor>[];
    if (json['colors'] is List) {
      for (final c in json['colors']) {
        if (c is Map<String, dynamic>) {
          colorsList.add(ProductColor.fromJson(c));
        } else if (c is Map) {
          colorsList.add(ProductColor.fromJson(Map<String, dynamic>.from(c)));
        }
      }
    }

    // Parse applications (can be strings or maps)
    final appsList = <String>[];
    if (json['applications'] is List) {
      for (final a in json['applications']) {
        if (a is String) {
          appsList.add(a);
        } else if (a is Map) {
          final enName = a['en']?.toString() ?? '';
          if (enName.isNotEmpty) appsList.add(enName.toLowerCase());
        }
      }
    }

    // Parse categories
    final catsList = <String>[];
    if (json['categories'] is List) {
      for (final cat in json['categories']) {
        if (cat != null) catsList.add(cat.toString());
      }
    }

    // Parse gallery images
    final galleryList = <String>[];
    if (json['galleryImages'] is List) {
      for (final g in json['galleryImages']) {
        if (g != null && g.toString().isNotEmpty) galleryList.add(g.toString());
      }
    }

    return Product(
      id: json['id']?.toString() ?? '',
      slug: json['slug']?.toString() ?? (json['id']?.toString() ?? ''),
      name: Translation.fromJson(json['name'], defaultEn: 'Product', defaultAr: 'منتج'),
      code: json['code']?.toString() ?? 'MT',
      description: Translation.fromJson(json['description']),
      thickness: json['thickness']?.toString() ?? '',
      width: json['width']?.toString() ?? '',
      materialType: Translation.fromJson(json['materialType'], defaultEn: 'PVC Leather', defaultAr: 'جلد PVC'),
      texture: Translation.fromJson(json['texture']),
      backing: Translation.fromJson(json['backing']),
      finish: Translation.fromJson(json['finish']),
      waterResistance: Translation.fromJson(json['waterResistance']),
      fireResistance: Translation.fromJson(json['fireResistance']),
      softnessLevel: Translation.fromJson(json['softnessLevel']),
      isNew: json['isNew'] == true || json['is_new'] == 1 || json['is_new'] == '1',
      isBestSeller: json['isBestSeller'] == true || json['is_best_seller'] == 1 || json['is_best_seller'] == '1',
      image: json['image']?.toString() ?? 'assets/images/products/soft-touch.jpg',
      galleryImages: galleryList,
      colors: colorsList,
      applications: appsList,
      categories: catsList,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'slug': slug,
    'name': name.toJson(),
    'code': code,
    'description': description.toJson(),
    'thickness': thickness,
    'width': width,
    'materialType': materialType.toJson(),
    'texture': texture.toJson(),
    'backing': backing.toJson(),
    'finish': finish.toJson(),
    'waterResistance': waterResistance.toJson(),
    'fireResistance': fireResistance.toJson(),
    'softnessLevel': softnessLevel.toJson(),
    'isNew': isNew,
    'isBestSeller': isBestSeller,
    'image': image,
    'galleryImages': galleryImages,
    'colors': colors.map((c) => c.toJson()).toList(),
    'applications': applications,
    'categories': categories,
  };
}

class ProductApplication {
  final String id;
  final Translation name;
  final Translation benefit;
  final String image;
  final String icon;

  const ProductApplication({
    required this.id,
    required this.name,
    required this.benefit,
    required this.image,
    required this.icon,
  });
}

class Industry {
  final String id;
  final Translation name;
  final Translation description;
  final String icon;
  final String image;
  final List<String> products;
  final List<String> applications;

  const Industry({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.image,
    required this.products,
    required this.applications,
  });
}

class LeatherAnalysis {
  final Translation category;
  final Translation grainPattern;
  final String sheen;
  final Translation texture;
  final String estimatedThickness;
  final String backingGuess;
  final List<String> recommendedUses;
  final List<String> recommendedUsesAr;
  final Translation summary;
  final int confidence;

  const LeatherAnalysis({
    required this.category,
    required this.grainPattern,
    required this.sheen,
    required this.texture,
    required this.estimatedThickness,
    required this.backingGuess,
    required this.recommendedUses,
    required this.recommendedUsesAr,
    required this.summary,
    required this.confidence,
  });

  factory LeatherAnalysis.fromJson(Map<String, dynamic> json) {
    return LeatherAnalysis(
      category: Translation(
        en: json['category_en']?.toString() ?? 'Leather Grain',
        ar: json['category_ar']?.toString() ?? 'نقشة جلدية',
      ),
      grainPattern: Translation(
        en: json['grain_pattern_en']?.toString() ?? 'Surface pattern',
        ar: json['grain_pattern_ar']?.toString() ?? 'نمط النقشة السطحية',
      ),
      sheen: json['sheen']?.toString() ?? 'Semi-matte',
      texture: Translation(
        en: json['texture_en']?.toString() ?? 'Supple texture',
        ar: json['texture_ar']?.toString() ?? 'ملمس ناعم ومرن',
      ),
      estimatedThickness: json['estimated_thickness']?.toString() ?? '1.1 - 1.2 mm',
      backingGuess: json['backing_guess']?.toString() ?? 'Microfiber Backing',
      recommendedUses: (json['recommended_uses'] as List?)?.map((e) => e.toString()).toList() ?? [],
      recommendedUsesAr: (json['recommended_uses_ar'] as List?)?.map((e) => e.toString()).toList() ?? [],
      summary: Translation(
        en: json['summary_en']?.toString() ?? '',
        ar: json['summary_ar']?.toString() ?? '',
      ),
      confidence: (json['confidence'] is num) ? (json['confidence'] as num).toInt() : 90,
    );
  }
}

class LeatherMatchItem {
  final Product product;
  final int matchScore;
  final Translation matchReason;

  const LeatherMatchItem({
    required this.product,
    required this.matchScore,
    required this.matchReason,
  });

  factory LeatherMatchItem.fromJson(Map<String, dynamic> json) {
    final prod = Product.fromJson(json);
    final score = (json['match_score'] is num) ? (json['match_score'] as num).toInt() : 85;
    final reasonMap = json['match_reason'];
    Translation reason;
    if (reasonMap is Map) {
      reason = Translation.fromJson(reasonMap);
    } else if (reasonMap is String) {
      reason = Translation(en: reasonMap, ar: reasonMap);
    } else {
      reason = const Translation(
        en: 'High visual and technical specifications match with catalog.',
        ar: 'تطابق عالي في المواصفات التقنية والنقشة السطحية مع الكتالوج.',
      );
    }

    return LeatherMatchItem(
      product: prod,
      matchScore: score,
      matchReason: reason,
    );
  }
}

class LeatherScanResult {
  final bool success;
  final bool aiPowered;
  final LeatherAnalysis analysis;
  final List<LeatherMatchItem> matches;
  final String? message;
  final String? error;

  const LeatherScanResult({
    required this.success,
    required this.aiPowered,
    required this.analysis,
    required this.matches,
    this.message,
    this.error,
  });

  factory LeatherScanResult.fromJson(Map<String, dynamic> json) {
    final analysisJson = json['analysis'] as Map<String, dynamic>? ?? {};
    final matchesList = <LeatherMatchItem>[];
    if (json['matched_products'] is List) {
      for (final item in json['matched_products']) {
        if (item is Map<String, dynamic>) {
          try {
            matchesList.add(LeatherMatchItem.fromJson(item));
          } catch (e) {
            // pass
          }
        }
      }
    }

    return LeatherScanResult(
      success: json['success'] == true,
      aiPowered: json['ai_powered'] == true,
      analysis: LeatherAnalysis.fromJson(analysisJson),
      matches: matchesList,
      message: json['message']?.toString(),
      error: json['error']?.toString(),
    );
  }
}

