import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, ChevronRight, Droplets, Shield, Zap, Leaf, 
  Sun, Wind, Layers, Sparkles, Package, Globe, Factory
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import ProductCard from "@/components/features/ProductCard";
import MaterialSelector from "@/components/features/MaterialSelector";
import SEO from "@/components/layout/SEO";
import heroImg from "@/assets/hero-leather.jpg";

export default function HomePage() {
  const { t, lang, isRTL } = useLanguage();
  const { products, industries, settings } = useContent();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const handleHeroMove = (e: React.MouseEvent<HTMLElement>) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 18;
    const y = (e.clientY / innerHeight - 0.5) * 14;
    setParallax({ x, y });
  };

  const whyFeatures = [
    { icon: Droplets, key: "why.waterproof", color: "text-blue-500" },
    { icon: Shield, key: "why.scratch", color: "text-emerald-500" },
    { icon: Zap, key: "why.softness", color: "text-amber-500" },
    { icon: Wind, key: "why.longevity", color: "text-purple-500" },
    { icon: Sparkles, key: "why.colors", color: "text-pink-500" },
    { icon: Sun, key: "why.uv", color: "text-orange-500" },
    { icon: Leaf, key: "why.eco", color: "text-green-500" },
    { icon: Layers, key: "why.flexible", color: "text-indigo-500" },
  ];

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <SEO
        title={lang === "ar" ? "ماتيريا – جلد صناعي فاخر ومصنع خامات جلود في مصر | MATERIA" : "MATERIA – Premium Artificial Leather Manufacturer in Egypt"}
        description={
          lang === "ar"
            ? "ماتيريا الشركة الرائدة في مصر لتصنيع وتوريد خامات الجلد الصناعي (PVC & PU) للأثاث، السيارات، الموضة، الفنادق والمستشفيات. معايير عالمية وضمان جودة."
            : "MATERIA is Egypt's leading manufacturer of high-performance PVC & PU artificial leather for furniture, automotive, fashion, hospitality, and healthcare."
        }
        canonical="https://materiaeg.com"
      />
      {/* ── HERO ── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        onMouseMove={handleHeroMove}
        onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      >
        {/* Background - 10s living video */}
        <div className="absolute inset-0 scale-110">
          <div
            className="w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
          >
            <video
              className="w-full h-full object-cover"
              src="/videos/hero-10s.mp4"
              poster={heroImg}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>


          {/* breathing warm glow */}
          <div
            className="absolute -top-24 -left-24 w-[34rem] h-[34rem] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(128,27,35,0.35), transparent 65%)", animation: "hero-glow 6s ease-in-out infinite" }}
          />
          {/* light sweep */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="hero-shine absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          {/* floating dust / spirit particles */}
          <div className="absolute inset-0">
            {[
              { left: "8%", size: 7, dur: "9s", delay: "0s" },
              { left: "22%", size: 5, dur: "12s", delay: "2s" },
              { left: "45%", size: 8, dur: "10s", delay: "1s" },
              { left: "63%", size: 4, dur: "13s", delay: "3.5s" },
              { left: "78%", size: 6, dur: "11s", delay: "0.8s" },
              { left: "90%", size: 5, dur: "14s", delay: "2.6s" },
            ].map((p, i) => (
              <span
                key={i}
                className="hero-particle"
                style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.dur, animationDelay: p.delay }}
              />
            ))}
          </div>
          {/* bottom vignette - always active for optimal contrast */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-charcoal-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
          <div className={`max-w-2xl ${isRTL ? "mr-auto ml-auto md:ml-0" : ""}`}>
            {/* Tagline */}
            <div className={`hero-fade-up inline-flex items-center gap-2 mb-6 ${isRTL ? "flex-row-reverse" : ""}`} style={{ animationDelay: "0.1s" }}>
              <div className="h-px w-8 bg-burgundy-500" />
              <span className="text-xs tracking-[0.25em] text-burgundy-400 uppercase font-semibold hero-text-shadow-sm">
                {t("hero.tagline")}
              </span>
            </div>

            {/* Title */}
            <h1
              className="hero-fade-up text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 hero-text-shadow"
              style={{
                fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif",
                whiteSpace: "pre-line",
                animationDelay: "0.25s",
              }}
            >
              {t("hero.title")}
            </h1>

            <p className="hero-fade-up text-lg text-charcoal-200 leading-relaxed mb-10 max-w-xl hero-text-shadow-sm" style={{ animationDelay: "0.4s" }}>
              {t("hero.subtitle")}
            </p>



          </div>

          {/* Stats */}
          <div className="hero-fade-up absolute bottom-10 left-6 right-6" style={{ animationDelay: "0.7s" }}>
            <div className="max-w-7xl mx-auto">
              <div className={`flex flex-wrap gap-8 mt-16 ${isRTL ? "justify-end" : ""}`}>
                {[
                  { stat: t("hero.stat1"), label: t("hero.stat1.label") },
                  { stat: t("hero.stat2"), label: t("hero.stat2.label") },
                  { stat: t("hero.stat3"), label: t("hero.stat3.label") },
                ].map((item, i) => (
                  <div key={i} className={`${isRTL ? "text-right" : "text-left"}`}>
                    <div className="text-3xl font-bold text-white hero-text-shadow"
                      style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
                      {item.stat}
                    </div>
                    <div className="text-xs text-charcoal-300 uppercase tracking-widest mt-0.5 hero-text-shadow-sm">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* scroll hint */}
          <div className="hero-fade-up absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2" style={{ animationDelay: "0.9s" }}>
            <span className="text-[10px] tracking-[0.3em] text-white/50 uppercase">Scroll</span>
            <span className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 ${isRTL ? "md:flex-row-reverse" : ""}`}>
            <div>
              <p className="text-xs text-burgundy-900 uppercase tracking-widest font-semibold mb-2">
                {isRTL ? "مجموعتنا" : "Our Collection"}
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-charcoal-900"
                style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
              >
                {t("products.title")}
              </h2>
              <p className="text-charcoal-500 text-sm mt-2">{t("products.subtitle")}</p>
            </div>
            <Link
              to="/products"
              className={`inline-flex items-center gap-2 text-sm font-semibold text-burgundy-900 hover:gap-3 transition-all whitespace-nowrap ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {isRTL ? "عرض كل الخامات" : "View All Materials"}
              <Arrow className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY MATERIA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-14 ${isRTL ? "text-right md:text-center" : ""}`}>
            <p className="text-xs text-burgundy-900 uppercase tracking-widest font-semibold mb-2">
              {isRTL ? "مميزات الخامة" : "Material Features"}
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-charcoal-900"
              style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
            >
              {t("why.title")}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {whyFeatures.map(({ icon: Icon, key, color }) => (
              <div
                key={key}
                className={`group p-6 rounded-2xl border border-cream-200 hover:border-burgundy-200 hover:shadow-md transition-all duration-300 ${isRTL ? "text-right" : "text-left"}`}
              >
                <div className={`w-11 h-11 rounded-xl bg-cream-100 group-hover:bg-burgundy-50 flex items-center justify-center mb-4 transition-colors ${isRTL ? "mr-auto" : ""}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h4 className="text-sm font-bold text-charcoal-900 mb-1.5">{t(`${key}`)}</h4>
                <p className="text-xs text-charcoal-500 leading-relaxed">{t(`${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 ${isRTL ? "md:flex-row-reverse" : ""}`}>
            <div>
              <p className="text-xs text-burgundy-900 uppercase tracking-widest font-semibold mb-2">
                {isRTL ? "قطاعاتنا" : "Our Sectors"}
              </p>
              <h2
                className="text-3xl md:text-4xl font-bold text-charcoal-900"
                style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
              >
                {t("industries.title")}
              </h2>
              <p className="text-charcoal-500 text-sm mt-2">{t("industries.subtitle")}</p>
            </div>
            <Link
              to="/industries"
              className={`inline-flex items-center gap-2 text-sm font-semibold text-burgundy-900 hover:gap-3 transition-all whitespace-nowrap ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {isRTL ? "عرض كل القطاعات" : "All Industries"}
              <Arrow className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {industries.map((industry) => (
              <Link
                key={industry.id}
                to={`/industries`}
                className="group relative overflow-hidden rounded-2xl aspect-square"
              >
                <img
                  src={industry.image}
                  alt={lang === "ar" ? industry.name.ar : industry.name.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className={`absolute bottom-0 ${isRTL ? "right-0 text-right" : "left-0"} p-4`}>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {lang === "ar" ? industry.name.ar : industry.name.en}
                  </h3>
                  <p className="text-xs text-cream-300 mt-1 line-clamp-2 hidden group-hover:block transition-all">
                    {lang === "ar" ? industry.description.ar : industry.description.en}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MATERIAL SELECTOR ── */}
      <MaterialSelector />

      {/* ── ABOUT STRIP ── */}
      <section className="py-16 bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 text-center`}>
            {[
              { icon: Package, stat: t("about.stat1"), label: t("about.stat1.label") },
              { icon: Factory, stat: t("about.stat2"), label: t("about.stat2.label") },
              { icon: Globe, stat: t("about.stat3"), label: t("about.stat3.label") },
              { icon: Layers, stat: t("about.stat4"), label: t("about.stat4.label") },
            ].map(({ icon: Icon, stat, label }, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-burgundy-50 rounded-2xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-burgundy-900" />
                </div>
                <div
                  className="text-3xl font-bold text-charcoal-900"
                  style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
                >
                  {stat}
                </div>
                <div className="text-xs text-charcoal-500 uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-burgundy-gradient py-16">
        <div className={`max-w-4xl mx-auto px-6 text-center ${isRTL ? "text-right md:text-center" : ""}`}>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {isRTL ? "جاهز لطلب عينة؟" : "Ready to Request a Sample?"}
          </h2>
          <p className="text-burgundy-200 mb-8 text-base">
            {isRTL
              ? "تواصل مع فريقنا الآن للحصول على عينات مجانية وعروض أسعار مخصصة لمشروعك"
              : "Contact our team now for free samples and custom quotes tailored to your project"}
          </p>
          <div className={`flex flex-wrap justify-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link
              to="/contact"
              className="bg-white text-burgundy-900 hover:bg-cream-100 font-semibold px-8 py-3.5 rounded transition-colors text-sm inline-flex items-center gap-2"
            >
              {t("product.requestSample")}
              <Arrow className="w-4 h-4" />
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp || "201000000000"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded transition-colors text-sm inline-flex items-center gap-2"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
