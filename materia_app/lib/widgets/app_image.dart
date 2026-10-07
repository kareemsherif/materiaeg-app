import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class AppImage extends StatelessWidget {
  final String imagePath;
  final BoxFit fit;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;

  const AppImage({
    super.key,
    required this.imagePath,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.borderRadius,
  });

  static const String baseUrl = 'https://materiaeg.com';

  bool get isBase64 {
    final path = imagePath.trim();
    return path.startsWith('data:image/') ||
        (path.length > 100 &&
            !path.startsWith('http') &&
            !path.startsWith('assets/'));
  }

  Uint8List? get base64Bytes {
    try {
      final path = imagePath.trim();
      final base64String = path.contains(',') ? path.split(',').last : path;
      return base64Decode(base64String);
    } catch (_) {
      return null;
    }
  }

  String get resolvedUrl {
    final path = imagePath.trim();
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    if (path.startsWith('/')) {
      return '$baseUrl$path';
    }
    if (path.startsWith('assets/images/products/')) {
      final filename = path.split('/').last;
      return '$baseUrl/product-images/$filename';
    }
    if (path.startsWith('assets/images/')) {
      final sub = path.replaceFirst('assets/images/', '');
      return '$baseUrl/$sub';
    }
    if (path.startsWith('assets/')) {
      return '$baseUrl/${path.replaceFirst('assets/', '')}';
    }
    return '$baseUrl/$path';
  }

  bool get isAsset {
    final path = imagePath.trim();
    return path.startsWith('assets/') && !path.startsWith('http');
  }

  @override
  Widget build(BuildContext context) {
    Widget imageWidget;

    if (isBase64) {
      final bytes = base64Bytes;
      if (bytes != null) {
        imageWidget = Image.memory(
          bytes,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (_, __, ___) => _fallbackWidget(),
        );
      } else {
        imageWidget = _fallbackWidget();
      }
    } else if (isAsset) {
      imageWidget = Image.asset(
        imagePath.trim(),
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (context, error, stackTrace) {
          final netUrl = resolvedUrl;
          if (netUrl.startsWith('http://') || netUrl.startsWith('https://')) {
            return Image.network(
              netUrl,
              width: width,
              height: height,
              fit: fit,
              errorBuilder: (_, __, ___) => _fallbackWidget(),
            );
          }
          return _fallbackWidget();
        },
      );
    } else {
      imageWidget = Image.network(
        resolvedUrl,
        width: width,
        height: height,
        fit: fit,
        loadingBuilder: (context, child, progress) {
          if (progress == null) return child;
          return Container(
            width: width,
            height: height,
            color: AppColors.surfaceSubtle,
            child: Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  value: progress.expectedTotalBytes != null
                      ? progress.cumulativeBytesLoaded /
                          progress.expectedTotalBytes!
                      : null,
                  color: AppColors.primary,
                ),
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) {
          return _fallbackWidget();
        },
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }

  Widget _fallbackWidget() {
    return Container(
      width: width,
      height: height,
      color: AppColors.surfaceSubtle,
      child: const Center(
        child: Icon(
          Icons.image_outlined,
          size: 28,
          color: AppColors.charcoal400,
        ),
      ),
    );
  }
}
