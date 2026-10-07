import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { lang, t, isRTL } = useLanguage();

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-white border border-cream-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.image}
          alt={lang === "ar" ? product.name.ar : product.name.en}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} flex flex-col gap-1.5`}>
          {product.isBestSeller && (
            <span className="badge-burgundy flex items-center gap-1 text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              {t("products.bestSeller")}
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {t("products.new")}
            </span>
          )}
        </div>

        {/* Color Dots Preview */}
        <div className={`absolute bottom-3 ${isRTL ? "left-3" : "right-3"} flex items-center gap-1`}>
          {(product.colors || []).slice(0, 5).map((color) => (
            <div
              key={color.hex}
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color.hex }}
              title={lang === "ar" ? color.name.ar : color.name.en}
            />
          ))}
          {(product.colors || []).length > 5 && (
            <div className="w-4 h-4 rounded-full bg-charcoal-800 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">+{(product.colors || []).length - 5}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className={`flex items-start justify-between gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-base font-bold text-charcoal-900 leading-tight">
              {lang === "ar" ? product.name.ar : product.name.en}
            </h3>
            <p className="text-xs text-charcoal-400 mt-0.5 font-mono">{product.code}</p>
          </div>
        </div>

        {/* Specs Row */}
        <div className={`flex items-center gap-3 mb-4 text-xs text-charcoal-500 ${isRTL ? "flex-row-reverse" : ""}`}>
          <span className="bg-cream-100 px-2 py-1 rounded font-medium">{product.thickness}</span>
          <span className="bg-cream-100 px-2 py-1 rounded font-medium">{product.width}</span>
          <span className="bg-cream-100 px-2 py-1 rounded font-medium">
            {lang === "ar" ? product.materialType.ar : product.materialType.en}
          </span>
        </div>

        {/* CTA */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold text-burgundy-900 group-hover:gap-2.5 transition-all ${isRTL ? "flex-row-reverse justify-start" : ""}`}>
          <span>{t("products.viewApplications")}</span>
          {isRTL ? (
            <ArrowLeft className="w-3.5 h-3.5" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </Link>
  );
}
