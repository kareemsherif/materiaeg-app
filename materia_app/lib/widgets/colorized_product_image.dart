import 'package:flutter/material.dart';
import 'app_image.dart';

class ColorizedProductImage extends StatelessWidget {
  final String imagePath;
  final Color? color;
  final BoxFit fit;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;

  const ColorizedProductImage({
    super.key,
    required this.imagePath,
    this.color,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    Widget result = LayoutBuilder(
      builder: (context, constraints) {
        final w = width ?? (constraints.hasBoundedWidth ? constraints.maxWidth : null);
        final h = height ?? (constraints.hasBoundedHeight ? constraints.maxHeight : null);

        Widget content;

        if (color == null) {
          content = AppImage(
            key: const ValueKey('original'),
            imagePath: imagePath,
            fit: fit,
            width: w,
            height: h,
          );
        } else {
          content = KeyedSubtree(
            key: ValueKey('color_${color!.toARGB32()}'),
            child: ColorFiltered(
              colorFilter: ColorFilter.mode(color!, BlendMode.color),
              child: AppImage(
                imagePath: imagePath,
                fit: fit,
                width: w,
                height: h,
              ),
            ),
          );
        }

        return SizedBox(
          width: w,
          height: h,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            switchInCurve: Curves.easeInOut,
            switchOutCurve: Curves.easeInOut,
            child: content,
          ),
        );
      },
    );

    if (borderRadius != null) {
      result = ClipRRect(
        borderRadius: borderRadius!,
        child: result,
      );
    }

    return result;
  }
}
