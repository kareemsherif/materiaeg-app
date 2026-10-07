import { Link } from "react-router-dom";
import { MessageCircle, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";

export default function Footer() {
  const { t, isRTL } = useLanguage();
  const { settings, products } = useContent();

  const whatsapp = settings.whatsapp || "201290053380";
  const email = settings.email || "info@materiaeg.com";
  const address1 = settings.address || t("contact.address1");
  const address2 = settings.address2 || t("contact.address2");
  const hotline = settings.hotline || "16870";
  const hours = isRTL
    ? settings.workingHoursAr || t("contact.hours")
    : settings.workingHours || t("contact.hours");

  const productLinks = products && products.length > 0
    ? products.slice(0, 5).map((p) => ({
        label: p.name,
        href: `/products/${p.slug}`,
      }))
    : [
        { label: { en: "Soft Touch 1.2mm", ar: "سوفت تاتش 1.2مم" }, href: "/products/soft-touch-1-2mm" },
        { label: { en: "Ultra Grip 1.4mm", ar: "ألترا جريب 1.4مم" }, href: "/products/ultra-grip-1-4mm" },
        { label: { en: "Auto Grade Perforated", ar: "أوتو جريد مثقب" }, href: "/products/auto-grade-perforated" },
        { label: { en: "Fashion Smooth", ar: "فاشن سموث" }, href: "/products/fashion-smooth-0-8mm" },
        { label: { en: "Medica Pro", ar: "ميديكا برو" }, href: "/products/medica-pro-antimicrobial" },
      ];

  const companyLinks = [
    { label: { en: "About Us", ar: "من نحن" }, href: "/about" },
    { label: { en: "Industries", ar: "الصناعات" }, href: "/industries" },
    { label: { en: "Quality", ar: "الجودة" }, href: "/about" },
    { label: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, href: "/privacy" },
    { label: { en: "Terms of Use", ar: "شروط الاستخدام" }, href: "/terms" },
    { label: { en: "Contact", ar: "تواصل معنا" }, href: "/contact" },
  ];

  return (
    <footer className="bg-charcoal-900 text-cream-200">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 ${isRTL ? "text-right" : "text-left"}`}>
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img
                src="/materia-logo.png"
                alt="Materia"
                className="h-14 w-auto brightness-0 invert opacity-95"
              />
            </div>
            <p className="text-sm text-charcoal-300 leading-relaxed mb-6">
              {t("footer.tagline")}
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whatsapp-pulse"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t("contact.whatsapp")}</span>
            </a>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              {t("footer.products")}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-charcoal-300 hover:text-cream-200 transition-colors"
                  >
                    {isRTL ? link.label.ar : link.label.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              {t("footer.company")}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-charcoal-300 hover:text-cream-200 transition-colors"
                  >
                    {isRTL ? link.label.ar : link.label.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-5">
              {t("footer.support")}
            </h4>
            <ul className="space-y-3">
              <li className={`flex items-start gap-2 text-sm text-charcoal-300 ${isRTL ? "flex-row-reverse" : ""}`}>
                <MapPin className="w-4 h-4 mt-0.5 text-burgundy-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-cream-100 block">
                    {isRTL ? "الإدارة (Administration):" : "Administration:"}
                  </span>
                  <span>{address1}</span>
                </div>
              </li>
              <li className={`flex items-start gap-2 text-sm text-charcoal-300 ${isRTL ? "flex-row-reverse" : ""}`}>
                <MapPin className="w-4 h-4 mt-0.5 text-burgundy-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-cream-100 block">
                    {isRTL ? "المصنع (Factory):" : "Factory:"}
                  </span>
                  <span>{address2}</span>
                </div>
              </li>
              <li>
                <a href={`tel:${hotline}`} className={`flex items-center gap-2 text-sm text-charcoal-300 hover:text-cream-200 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Phone className="w-4 h-4 text-burgundy-400 shrink-0" />
                  <span>
                    <span className="text-xs font-semibold text-cream-100 mr-1 ml-1">{isRTL ? "الخط الساخن:" : "Hotline:"}</span>
                    {hotline}
                  </span>
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className={`flex items-center gap-2 text-sm text-charcoal-300 hover:text-cream-200 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Mail className="w-4 h-4 text-burgundy-400 shrink-0" />
                  <span>{email}</span>
                </a>
              </li>
              <li className={`flex items-center gap-2 text-sm text-charcoal-300 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Clock className="w-4 h-4 text-burgundy-400 shrink-0" />
                <span>{hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal-700">
        <div className={`max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 ${isRTL ? "md:flex-row-reverse" : ""}`}>
          <p className="text-xs text-charcoal-400">{t("footer.rights")}</p>
          <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Link to="/privacy" className="text-xs text-charcoal-400 hover:text-cream-200 transition-colors">
              {t("footer.privacy")}
            </Link>
            <span className="text-charcoal-600">·</span>
            <Link to="/terms" className="text-xs text-charcoal-400 hover:text-cream-200 transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
