import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { SELECTOR_RECOMMENDATIONS } from "@/constants/data";

const selectionOptions = [
  { key: "sofa", icon: "🛋️" },
  { key: "chair", icon: "💼" },
  { key: "car", icon: "🚗" },
  { key: "bag", icon: "👜" },
  { key: "shoes", icon: "👟" },
  { key: "hotel", icon: "🏨" },
  { key: "clinic", icon: "🏥" },
];

export default function MaterialSelector() {
  const { t, lang, isRTL } = useLanguage();
  const { products, settings } = useContent();
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (key: string) => {
    setSelected(key);
    setShowResult(false);
    setTimeout(() => setShowResult(true), 300);
  };

  const recommendation = selected ? SELECTOR_RECOMMENDATIONS[selected] : null;
  const recommendedProduct = recommendation && products.length > 0
    ? (products.find((p) => p.id === recommendation.productId) ||
       products.find((p) => Array.isArray(p.applications) && p.applications.includes(selected as string)) ||
       products.find((p) => Array.isArray(p.categories) && p.categories.some((c: unknown) => typeof c === "string" && c.toLowerCase().includes(selected as string))) ||
       products[0])
    : null;

  return (
    <section className="py-20 bg-charcoal-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-leather opacity-30" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-10 ${isRTL ? "text-right md:text-center" : ""}`}>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {t("selector.title")}
          </h2>
          <p className="text-charcoal-300 text-base">{t("selector.subtitle")}</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {selectionOptions.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center group ${
                selected === key
                  ? "border-burgundy-500 bg-burgundy-900/80 text-white"
                  : "border-charcoal-600 bg-charcoal-800/50 text-charcoal-200 hover:border-burgundy-600 hover:bg-charcoal-700"
              }`}
            >
              {selected === key && (
                <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-burgundy-300" />
              )}
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-semibold leading-tight">
                {t(`selector.${key}`)}
              </div>
            </button>
          ))}
        </div>

        {/* Result */}
        {showResult && recommendation && recommendedProduct && (
          <div className={`bg-white/5 backdrop-blur-sm border border-burgundy-700/50 rounded-2xl p-6 animate-fade-up ${isRTL ? "text-right" : "text-left"}`}>
            <div className={`flex flex-col md:flex-row gap-5 items-start ${isRTL ? "md:flex-row-reverse" : ""}`}>
              <img
                src={recommendedProduct.image}
                alt={lang === "ar" ? recommendedProduct.name.ar : recommendedProduct.name.en}
                className="w-full md:w-36 h-28 object-cover rounded-xl shrink-0"
              />
              <div className="flex-1">
                <p className="text-xs text-burgundy-400 uppercase tracking-widest font-semibold mb-1">
                  {t("selector.result")}
                </p>
                <h3 className="text-xl font-bold text-white mb-2">
                  {lang === "ar" ? recommendedProduct.name.ar : recommendedProduct.name.en}
                </h3>
                <p className="text-sm text-charcoal-300 leading-relaxed mb-4">
                  {lang === "ar" ? recommendation.reason.ar : recommendation.reason.en}
                </p>
                <div className={`flex flex-wrap gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Link
                    to={`/products/${recommendedProduct.slug}`}
                    className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    {t("products.viewApplications")}
                    {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </Link>
                  <a
                    href={`https://wa.me/${settings.whatsapp || "201000000000"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t("selector.cta")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
