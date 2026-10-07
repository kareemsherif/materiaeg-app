import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import ProductCard from "@/components/features/ProductCard";
import MaterialSelector from "@/components/features/MaterialSelector";
import SEO from "@/components/layout/SEO";

const FILTERS = [
  { key: "all", en: "All Materials", ar: "كل الخامات" },
  { key: "best-seller", en: "★ Best Sellers", ar: "★ الأكثر مبيعاً" },
  { key: "new", en: "✦ New Arrivals", ar: "✦ أحدث الخامات" },
  { key: "fine-grains", en: "Fine Grains & Plain Papers", ar: "نقشات ناعمة وخامات ملساء" },
  { key: "medium-large", en: "Medium & Large Grains", ar: "نقشات متوسطة وكبيرة" },
  { key: "textile", en: "Textile & Exotic Grains", ar: "أقمشة وجلود نادرة" },
  { key: "furniture", en: "Furniture", ar: "الأثاث" },
  { key: "automotive", en: "Automotive", ar: "السيارات" },
  { key: "fashion", en: "Fashion", ar: "الموضة" },
  { key: "medical", en: "Medical", ar: "الطبي" },
];

export default function ProductsPage() {
  const { t, lang, isRTL } = useLanguage();
  const { products } = useContent();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get("search") || searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set("search", val);
    } else {
      newParams.delete("search");
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    newParams.delete("q");
    setSearchParams(newParams, { replace: true });
  };

  const resetAll = () => {
    clearSearch();
    setActiveFilter("all");
  };

  const filtered = useMemo(() => {
    let result = products;

    // Filter by category
    if (activeFilter === "best-seller") {
      result = result.filter((p) => p.isBestSeller);
    } else if (activeFilter === "new") {
      result = result.filter((p) => p.isNew);
    } else if (activeFilter !== "all") {
      result = result.filter((p) => (p.categories || []).includes(activeFilter));
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const nameEn = (p.name?.en || "").toLowerCase();
        const nameAr = (p.name?.ar || "").toLowerCase();
        const code = (p.code || "").toLowerCase();
        const descEn = (p.description?.en || "").toLowerCase();
        const descAr = (p.description?.ar || "").toLowerCase();
        const matEn = (p.materialType?.en || "").toLowerCase();
        const matAr = (p.materialType?.ar || "").toLowerCase();
        const texEn = (p.texture?.en || "").toLowerCase();
        const texAr = (p.texture?.ar || "").toLowerCase();
        const cats = (p.categories || []).join(" ").toLowerCase();
        const apps = (p.applications || []).join(" ").toLowerCase();
        const colors = (p.colors || [])
          .map((c) => `${c.name?.en || ""} ${c.name?.ar || ""}`)
          .join(" ")
          .toLowerCase();

        return (
          nameEn.includes(q) ||
          nameAr.includes(q) ||
          code.includes(q) ||
          descEn.includes(q) ||
          descAr.includes(q) ||
          matEn.includes(q) ||
          matAr.includes(q) ||
          texEn.includes(q) ||
          texAr.includes(q) ||
          cats.includes(q) ||
          apps.includes(q) ||
          colors.includes(q)
        );
      });
    }

    return result;
  }, [products, activeFilter, searchQuery]);

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <SEO
        title={lang === "ar" ? "كتالوج خامات الجلد الصناعي الفاخر | ماتيريا مصر" : "Artificial Leather Materials Catalog | MATERIA Egypt"}
        description={
          lang === "ar"
            ? "استكشف أوسع تشكيلة من خامات الجلد الصناعي (PVC & PU) بمختلف السماكات والألوان والنقشات للأثاث والسيارات والموضة. اطلب عينات مجانية وتسعيرة فورية."
            : "Explore MATERIA's comprehensive catalog of premium artificial leather (PVC & PU) for furniture, automotive, and fashion. Request free swatches."
        }
        canonical="https://materiaeg.com/products"
        breadcrumbs={[
          { name: lang === "ar" ? "الرئيسية" : "Home", url: "/" },
          { name: lang === "ar" ? "الخامات والمنتجات" : "Products", url: "/products" },
        ]}
      />
      {/* Page Header */}
      <section className="bg-charcoal-900 py-14 relative overflow-hidden">
        <div className="absolute inset-0 pattern-leather opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className={`flex items-center gap-2 text-xs text-charcoal-400 mb-4 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <Link to="/" className="hover:text-white cursor-pointer transition-colors">{t("nav.home")}</Link>
            <span>/</span>
            <span className="text-cream-200">{t("nav.products")}</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {t("products.title")}
          </h1>
          <p className="text-charcoal-300 text-base max-w-xl mb-6">{t("products.subtitle")}</p>

          {/* Prominent Search Bar in Hero */}
          <div className="max-w-2xl">
            <div className="relative flex items-center">
              <div className={`absolute ${isRTL ? "right-4" : "left-4"} pointer-events-none text-charcoal-400`}>
                <Search className="w-5 h-5 text-burgundy-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={isRTL ? "ابحث بالاسم، الكود، النقشة، أو الاستخدام..." : "Search by name, code, grain, or application..."}
                className={`w-full py-3.5 ${
                  isRTL ? "pr-12 pl-10 text-right" : "pl-12 pr-10 text-left"
                } rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-charcoal-300 border border-white/20 focus:border-burgundy-400 focus:bg-white/15 focus:outline-none transition-all duration-200 shadow-lg text-sm md:text-base`}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className={`absolute ${isRTL ? "left-3" : "right-3"} p-1 text-charcoal-300 hover:text-white hover:bg-white/10 rounded-full transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Sticky Bar */}
      <section className="bg-white border-b border-cream-200 sticky top-[64px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center gap-2 overflow-x-auto scrollbar-hide py-3.5 ${isRTL ? "flex-row-reverse" : ""}`}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 ${
                  activeFilter === f.key
                    ? "bg-burgundy-900 text-white shadow-sm"
                    : "bg-cream-100 text-charcoal-600 hover:bg-cream-200"
                }`}
              >
                {isRTL ? f.ar : f.en}
              </button>
            ))}
          </div>

          {/* Active Search & Filter Indicator */}
          {(searchQuery.trim() || activeFilter !== "all") && (
            <div className={`py-2 px-1 border-t border-cream-100 flex items-center justify-between text-xs text-charcoal-500 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex items-center gap-2">
                <span>
                  {isRTL
                    ? `تم العثور على ${filtered.length} خامة`
                    : `Found ${filtered.length} materials`}
                </span>
                {searchQuery.trim() && (
                  <span className="bg-burgundy-50 text-burgundy-900 px-2 py-0.5 rounded font-medium border border-burgundy-100">
                    &quot;{searchQuery}&quot;
                  </span>
                )}
              </div>
              <button
                onClick={resetAll}
                className="text-burgundy-800 hover:text-burgundy-950 font-medium hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                {isRTL ? "إعادة الضبط" : "Reset filters"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-cream-50 min-h-[500px]">
        <div className="max-w-7xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-cream-200 p-8 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center text-charcoal-400">
                <Search className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-800 mb-1">
                {isRTL ? "لم يتم العثور على نتائج" : "No materials found"}
              </h3>
              <p className="text-sm text-charcoal-500 mb-6">
                {searchQuery
                  ? (isRTL ? `لا توجد خامات مطابقة لـ "${searchQuery}"` : `No products match "${searchQuery}"`)
                  : (isRTL ? "لا توجد خامات في هذا التصنيف" : "No products available in this category")}
              </p>
              <button
                onClick={resetAll}
                className="px-5 py-2.5 bg-burgundy-900 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-burgundy-800 transition-colors shadow"
              >
                {isRTL ? "عرض كل الخامات" : "View All Materials"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <MaterialSelector />
    </div>
  );
}
