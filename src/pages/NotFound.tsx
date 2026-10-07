import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SEO from "@/components/layout/SEO";

export default function NotFound() {
  const { lang, isRTL } = useLanguage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-cream-50">
      <SEO
        title={lang === "ar" ? "404 - الصفحة غير موجودة | ماتيريا" : "404 - Page Not Found | MATERIA"}
        noIndex={true}
      />
      <div className="text-8xl font-bold text-burgundy-900 mb-4"
        style={{ fontFamily: "Playfair Display, serif" }}>
        404
      </div>
      <h2 className="text-2xl font-bold text-charcoal-900 mb-3">
        {isRTL ? "الصفحة غير موجودة" : "Page Not Found"}
      </h2>
      <p className="text-charcoal-500 mb-8 max-w-sm">
        {isRTL
          ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها"
          : "The page you're looking for doesn't exist or has been moved"}
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          {isRTL ? "الرئيسية" : "Home"}
        </Link>
        <Link to="/products" className="btn-outline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {isRTL ? "المنتجات" : "Products"}
        </Link>
      </div>
    </div>
  );
}
