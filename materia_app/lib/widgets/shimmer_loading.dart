import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// A shimmer/skeleton loading placeholder widget.
/// Used while products are loading from the API.
class ShimmerLoading extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerLoading({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.borderRadius = 8,
  });

  @override
  State<ShimmerLoading> createState() => _ShimmerLoadingState();
}

class _ShimmerLoadingState extends State<ShimmerLoading>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    _animation = Tween<double>(begin: -2, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment(_animation.value - 1, 0),
              end: Alignment(_animation.value + 1, 0),
              colors: const [
                AppColors.cream200,
                AppColors.cream100,
                AppColors.cream200,
              ],
            ),
          ),
        );
      },
    );
  }
}

/// A skeleton placeholder for a product card.
class ProductCardSkeleton extends StatelessWidget {
  const ProductCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.hairline, width: 1),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image placeholder
          const AspectRatio(
            aspectRatio: 4 / 3,
            child: ShimmerLoading(borderRadius: 0, height: double.infinity),
          ),
          // Content placeholder
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const ShimmerLoading(width: 180, height: 16),
                const SizedBox(height: 8),
                const ShimmerLoading(width: 100, height: 12),
                const SizedBox(height: 12),
                // Color circles placeholder
                Row(
                  children: List.generate(
                    5,
                    (i) => Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ShimmerLoading(
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Spec chips placeholder
                Row(
                  children: [
                    const ShimmerLoading(width: 60, height: 20, borderRadius: 4),
                    const SizedBox(width: 6),
                    const ShimmerLoading(width: 60, height: 20, borderRadius: 4),
                    const SizedBox(width: 6),
                    const ShimmerLoading(width: 80, height: 20, borderRadius: 4),
                  ],
                ),
                const SizedBox(height: 12),
                const ShimmerLoading(width: 130, height: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
