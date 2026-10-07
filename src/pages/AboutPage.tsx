import { Link } from "react-router-dom";
import { MapPin, Award, Truck, Factory, Users, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SEO from "@/components/layout/SEO";
import factoryImg from "@/assets/factory-interior.jpg";
import heroImg from "@/assets/hero-leather.jpg";

export default function AboutPage() {
  const { t, lang, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const stats = [
    { stat: t("about.stat1"), label: t("about.stat1.label") },
    { stat: t("about.stat2"), label: t("about.stat2.label") },
    { stat: t("about.stat3"), label: t("about.stat3.label") },
    { stat: t("about.stat4"), label: t("about.stat4.label") },
  ];

  const locations = [
    {
      icon: MapPin,
      title: t("about.alex"),
      desc: t("about.alex.desc"),
      color: "text-burgundy-900",
      bg: "bg-burgundy-50",
    },
    {
      icon: Factory,
      title: t("about.sadat"),
      desc: t("about.sadat.desc"),
      color: "text-charcoal-700",
      bg: "bg-cream-100",
    },
    {
      icon: Award,
      title: t("about.quality"),
      desc: t("about.quality.desc"),
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      icon: Truck,
      title: t("about.export"),
      desc: t("about.export.desc"),
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  const values = isRTL
    ? ["جودة لا تُقبل المساومة في كل رول", "شراكات طويلة الأمد مع عملائنا", "الابتكار المستمر في تطوير الخامات", "خدمة ما بعد البيع والدعم الفني"]
    : ["Uncompromising quality in every roll", "Long-term partnerships with our clients", "Continuous innovation in material development", "After-sales service and technical support"];

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <SEO
        title={lang === "ar" ? "عن ماتيريا | مصنع الجلد الصناعي الرائد في مصر" : "About MATERIA | Egypt's Leading Artificial Leather Manufacturer"}
        description={
          lang === "ar"
            ? "تعرف على شركة ماتيريا، مصانعنا في الإسكندرية ومدينة السادات، ومعايير الجودة العالمية في تصنيع خامات الجلد الصناعي PVC وPU. أكثر من 15 عاماً من الخبرة."
            : "Learn about MATERIA, our manufacturing facilities in Alexandria & Sadat City, and our commitment to world-class artificial leather production."
        }
        canonical="https://materiaeg.com/about"
        breadcrumbs={[
          { name: lang === "ar" ? "الرئيسية" : "Home", url: "/" },
          { name: lang === "ar" ? "عن ماتيريا" : "About", url: "/about" },
        ]}
      />
      {/* Page Header */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="About Materia" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-950/80" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className={`flex items-center gap-2 text-xs text-charcoal-400 mb-6 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <Link to="/" className="hover:text-cream-200 transition-colors">{t("nav.home")}</Link>
            <span>/</span>
            <span className="text-cream-200">{t("nav.about")}</span>
          </div>
          <div className={`max-w-2xl ${isRTL ? "ml-auto mr-0 md:mr-auto" : ""}`}>
            <div className={`inline-flex items-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="h-px w-8 bg-burgundy-500" />
              <span className="text-xs text-burgundy-400 uppercase tracking-widest font-semibold">
                {isRTL ? "شركتنا" : "Our Company"}
              </span>
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
            >
              {t("about.title")}
            </h1>
            <p className="text-lg text-charcoal-200 leading-relaxed">{t("about.subtitle")}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div
                  className="text-4xl font-bold text-burgundy-900 mb-1"
                  style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
                >
                  {s.stat}
                </div>
                <div className="text-xs text-charcoal-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story & Timeline */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-start ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            <div>
              <p className="text-xs text-burgundy-900 uppercase tracking-widest font-semibold mb-3">
                {isRTL ? "رحلتنا عبر العقود" : "Our Journey Through Decades"}
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-8"
                style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
              >
                {isRTL ? "من العراقة إلى الابتكار الحديث" : "From Heritage to Modern Innovation"}
              </h2>
              
              <div className="space-y-8 relative before:absolute before:inset-y-0 before:w-px before:bg-cream-300 before:left-0 isRTL:before:left-auto isRTL:before:right-0">
                {[
                  { year: "1970", ar: "التأسيس كشركة تابعة للقطاع العام (EPEI)، وريادة صناعة الجلود الصناعية في مصر.", en: "Founded as a public sector company (EPEI), pioneering the artificial leather industry in Egypt." },
                  { year: "2000", ar: "التحول إلى كيان خاص، لتعزيز المرونة والتركيز على تلبية متطلبات العملاء.", en: "Transitioned to a private entity, enhancing flexibility and focus on customer requirements." },
                  { year: "2025", ar: "بدء مرحلة تحولية جديدة مع الانتقال إلى منشأة متطورة في منطقة السادات الصناعية.", en: "Started a new transformative phase with the move to a state-of-the-art facility in Sadat Industrial Zone." },
                  { year: "2026", en: "Launch of Materia: Next-gen materials for the future.", ar: "إطلاق علامة ماتيريا: مواد من الجيل الجديد للمستقبل." }
                ].map((item, i) => (
                  <div key={i} className={`relative pl-8 ${isRTL ? "pl-0 pr-8 text-right" : ""}`}>
                    <div className={`absolute top-0 w-3 h-3 rounded-full bg-burgundy-900 border-4 border-white shadow-sm ${isRTL ? "-right-1.5" : "-left-1.5"}`} />
                    <span className="text-sm font-bold text-burgundy-900 block mb-1">{item.year}</span>
                    <p className="text-sm text-charcoal-600 leading-relaxed">{lang === "ar" ? item.ar : item.en}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={factoryImg}
                  alt="Materia Factory"
                  className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl"
                />
                <div className={`absolute -bottom-6 ${isRTL ? "-left-6" : "-right-6"} bg-burgundy-900 text-white p-6 rounded-2xl shadow-xl max-w-[220px]`}>
                  <div className="text-3xl font-bold mb-1" style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
                    2025
                  </div>
                  <div className="text-xs text-burgundy-300 uppercase tracking-wider">
                    {isRTL ? "نقلة تكنولوجية كبرى" : "A Strategic Tech Leap"}
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm">
                <h3 className="text-lg font-bold text-charcoal-900 mb-4">{isRTL ? "منشأة منطقة السادات الصناعية" : "Sadat Industrial Zone Facility"}</h3>
                <ul className="space-y-3">
                  {[
                    { ar: "آلات إنتاج متطورة من الجيل الأخير", en: "Advanced latest-generation production machinery" },
                    { ar: "زيادة كبيرة في الطاقة الإنتاجية", en: "Significant boost in production capacity" },
                    { ar: "أنظمة متكاملة لضمان استمرارية الجودة", en: "Integrated systems for consistent quality assurance" },
                    { ar: "تصميم حديث يراعي المسؤولية البيئية", en: "Modern design focused on environmental responsibility" }
                  ].map((val, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm text-charcoal-600 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lang === "ar" ? val.ar : val.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Summary */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-16 ${isRTL ? "text-right md:text-center" : ""}`}>
            <h2
              className="text-3xl font-bold text-charcoal-900 mb-4"
              style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
            >
              {isRTL ? "حلول شاملة لكل قطاع" : "Comprehensive Solutions for Every Sector"}
            </h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto text-sm">
              {isRTL ? "نقدم تشكيلة واسعة من منتجات الجلود الصناعية المصممة لتلبية احتياجاتك الخاصة" : "We offer a wide range of artificial leather products engineered to meet your specific needs."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: { en: "Fashion", ar: "الموضة والملابس" }, desc: { en: "Footwear, bags, and apparel", ar: "خامات عصرية للأحذية والحقائب والملابس" } },
              { title: { en: "Furniture", ar: "الأثاث والتنجيد" }, desc: { en: "Home and office upholstery", ar: "مواد عالية الأداء لأثاث المنازل والمكاتب" } },
              { title: { en: "Automotive", ar: "ديكورات السيارات" }, desc: { en: "Durable car seat interiors", ar: "خامات تقنية متينة لمقاعد وتشطيبات السيارات" } },
              { title: { en: "Specialized", ar: "تطبيقات متخصصة" }, desc: { en: "Custom industrial solutions", ar: "حلول مصممة خصيصاً للاحتياجات الصناعية" } }
            ].map((cat, i) => (
              <div key={i} className={`p-6 bg-cream-50 rounded-2xl border border-cream-100 ${isRTL ? "text-right" : ""}`}>
                <h4 className="text-base font-bold text-burgundy-900 mb-2">{lang === "ar" ? cat.title.ar : cat.title.en}</h4>
                <p className="text-xs text-charcoal-500 leading-relaxed">{lang === "ar" ? cat.desc.ar : cat.desc.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-burgundy-gradient py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {isRTL ? "شريكك الموثوق في الخامات الفاخرة" : "Your Trusted Premium Materials Partner"}
          </h2>
          <p className="text-burgundy-200 mb-8">
            {isRTL ? "تواصل معنا اليوم لمناقشة متطلبات مشروعك" : "Reach out today to discuss your project requirements"}
          </p>
          <div className={`flex flex-wrap justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link to="/contact" className="bg-white text-burgundy-900 hover:bg-cream-100 font-semibold px-8 py-3.5 rounded text-sm transition-colors inline-flex items-center gap-2">
              {t("contact.title")}
              <Arrow className="w-4 h-4" />
            </Link>
            <Link to="/products" className="border border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded text-sm transition-colors">
              {t("nav.products")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
