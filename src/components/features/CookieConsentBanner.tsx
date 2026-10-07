import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function CookieConsentBanner() {
  const { isRTL } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("materia-cookie-consent");
    if (!consent) {
      // Small timeout for smooth slide-in
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("materia-cookie-consent", "all");
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("materia-cookie-consent", "essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Notice"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-fade-up"
    >
      <div className="bg-charcoal-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-charcoal-700 shadow-2xl">
        <div className={`flex items-start gap-3 mb-3 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>
          <div className="w-8 h-8 rounded-lg bg-burgundy-900/80 border border-burgundy-700/60 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-burgundy-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-cream-100">
              {isRTL ? "إشعار الخصوصية وملفات الارتباط" : "Privacy & Cookie Notice"}
            </h4>
            <p className="text-xs text-charcoal-300 mt-1 leading-relaxed">
              {isRTL ? (
                <>
                  نستخدم ملفات الارتباط والتخزين المحلي لتحسين تجربتك وتقديم أفضل خدمة لتصفح الخامات وفق{" "}
                  <Link to="/privacy" className="text-burgundy-300 underline hover:text-white">
                    سياسة الخصوصية
                  </Link>{" "}
                  و{" "}
                  <Link to="/terms" className="text-burgundy-300 underline hover:text-white">
                    شروط الاستخدام
                  </Link>.
                </>
              ) : (
                <>
                  We use cookies and local storage to optimize your browsing experience in accordance with our{" "}
                  <Link to="/privacy" className="text-burgundy-300 underline hover:text-white">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link to="/terms" className="text-burgundy-300 underline hover:text-white">
                    Terms of Use
                  </Link>.
                </>
              )}
            </p>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-charcoal-400 hover:text-cream-100 p-1 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`flex items-center gap-2 pt-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 rounded-lg bg-burgundy-800 hover:bg-burgundy-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            {isRTL ? "قبول الكل" : "Accept All"}
          </button>
          <button
            onClick={handleAcceptEssential}
            className="py-2 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-cream-100 text-xs font-medium border border-charcoal-700 transition-colors"
          >
            {isRTL ? "الضرورية فقط" : "Essential Only"}
          </button>
        </div>
      </div>
    </div>
  );
}
