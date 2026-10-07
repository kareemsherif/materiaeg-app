import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import SEO from "@/components/layout/SEO";

export default function IndustriesPage() {
  const { t, lang, isRTL } = useLanguage();
  const { settings, industries, products } = useContent();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <SEO
        title={lang === "ar" ? "مجالات واستخدامات الجلد الصناعي | الأثاث، السيارات، الفنادق – ماتيريا" : "Industries & Leather Applications | Automotive, Furniture, Hospitality – MATERIA"}
        description={
          lang === "ar"
            ? "حلول جلود صناعية متخصصة ومصممة لقطاعات الأثاث المنزلي والمكتبي، فرش السيارات، الفنادق، المستشفيات، والموضة. مصنعة وفق أعلى معايير الجودة والتحمل."
            : "Engineered synthetic leather solutions tailored for residential & contract furniture, automotive interiors, hospitality, healthcare, and fashion."
        }
        canonical="https://materiaeg.com/industries"
        breadcrumbs={[
          { name: lang === "ar" ? "الرئيسية" : "Home", url: "/" },
          { name: lang === "ar" ? "مجالات الاستخدام" : "Industries", url: "/industries" },
        ]}
      />
      {/* Page Header */}
      <section className="bg-charcoal-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-leather opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className={`flex items-center gap-2 text-xs text-charcoal-400 mb-4 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <Link to="/" className="hover:text-cream-200 transition-colors">{t("nav.home")}</Link>
            <span>/</span>
            <span className="text-cream-200">{t("nav.industries")}</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {t("industries.title")}
          </h1>
          <p className="text-charcoal-300 text-base max-w-xl">{t("industries.subtitle")}</p>
        </div>
      </section>

      {/* Industries List */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          {industries.map((industry, idx) => {
            const industryProducts = products.filter((p) =>
              Array.isArray(industry.products) && industry.products.includes(p.id)
            );
            const isEven = idx % 2 === 0;

            return (
              <div
                key={industry.id}
                className={`bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-sm`}
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 ${
                    isRTL
                      ? isEven
                        ? "lg:grid-flow-dense"
                        : ""
                      : isEven
                      ? ""
                      : "lg:grid-flow-dense"
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden aspect-[4/3] lg:aspect-auto ${
                      !isEven && !isRTL ? "lg:col-start-2" : ""
                    }`}
                  >
                    {industry.image ? (
                      <img
                        src={industry.image}
                        alt={lang === "ar" ? industry.name.ar : industry.name.en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[240px] bg-burgundy-gradient pattern-leather" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-none" />
                    <div className={`absolute bottom-4 ${isRTL ? "right-4" : "left-4"} lg:hidden`}>
                      <h2 className="text-xl font-bold text-white">
                        {lang === "ar" ? industry.name.ar : industry.name.en}
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-8 lg:p-12 flex flex-col justify-center`}>
                    <h2
                      className="hidden lg:block text-3xl font-bold text-charcoal-900 mb-4"
                      style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
                    >
                      {lang === "ar" ? industry.name.ar : industry.name.en}
                    </h2>
                    <p className="text-charcoal-600 leading-relaxed mb-6 text-sm">
                      {lang === "ar" ? industry.description.ar : industry.description.en}
                    </p>

                    {/* Applications Tags */}
                    <div className="mb-6">
                      <p className="text-xs text-charcoal-400 uppercase tracking-wider font-semibold mb-3">
                        {isRTL ? "التطبيقات" : "Applications"}
                      </p>
                      <div className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        {industry.applications.map((app) => (
                          <span
                            key={app}
                            className="text-xs bg-cream-100 text-charcoal-700 px-3 py-1.5 rounded-full font-medium"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Products */}
                    {industryProducts.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs text-charcoal-400 uppercase tracking-wider font-semibold mb-3">
                          {isRTL ? "الخامات الموصى بها" : "Recommended Materials"}
                        </p>
                        <div className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                          {industryProducts.map((p) => (
                            <Link
                              key={p.id}
                              to={`/products/${p.slug}`}
                              className="inline-flex items-center gap-1.5 bg-burgundy-50 text-burgundy-900 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-burgundy-100 transition-colors"
                            >
                              {lang === "ar" ? p.name.ar : p.name.en}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      to="/products"
                      className={`inline-flex items-center gap-2 text-sm font-semibold text-burgundy-900 hover:gap-3 transition-all ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      {isRTL ? "استكشف الخامات" : "Explore Materials"}
                      <Arrow className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-burgundy-gradient">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {isRTL ? "ابحث عن الخامة المثالية لصناعتك" : "Find the Perfect Material for Your Industry"}
          </h2>
          <p className="text-burgundy-200 mb-8">
            {isRTL
              ? "فريق متخصص جاهز لمساعدتك في اختيار أفضل الخامات لمشروعك"
              : "Our specialists are ready to help you choose the best materials for your project"}
          </p>
          <div className={`flex flex-wrap justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link to="/contact" className="bg-white text-burgundy-900 hover:bg-cream-100 font-semibold px-8 py-3.5 rounded text-sm transition-colors inline-flex items-center gap-2">
              {t("nav.quote")}
              <Arrow className="w-4 h-4" />
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp || "201000000000"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded text-sm transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
