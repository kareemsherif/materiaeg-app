import { useState } from "react";
import { Save, Search, Languages, ChevronRight } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export default function ManageTranslations() {
  const { translations, updateTranslations } = useContent();
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [localTranslations, setLocalTranslations] = useState(translations);
  const [activeCategory, setActiveCategory] = useState<string>("hero");

  const categories = [
    { id: "hero", name: { en: "Hero Section", ar: "قسم الاستقبال" } },
    { id: "nav", name: { en: "Navigation", ar: "القائمة العلوية" } },
    { id: "products", name: { en: "Products", ar: "المنتجات" } },
    { id: "industries", name: { en: "Industries", ar: "الصناعات" } },
    { id: "about", name: { en: "About Us", ar: "من نحن" } },
    { id: "contact", name: { en: "Contact", ar: "تواصل معنا" } },
    { id: "footer", name: { en: "Footer", ar: "تذييل الصفحة" } },
  ];

  const handleUpdate = (lang: "en" | "ar", key: string, value: string) => {
    setLocalTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    const ok = await updateTranslations(localTranslations);
    if (ok) {
      toast.success(isRTL ? "تم حفظ التعديلات بنجاح" : "Translations saved successfully");
    } else {
      toast.error(isRTL ? "فشل حفظ الترجمات في قاعدة البيانات" : "Failed to save translations to the database");
    }
  };

  const filteredKeys = Object.keys(localTranslations.en).filter(key => 
    (key.startsWith(activeCategory) || searchTerm) &&
    (key.toLowerCase().includes(searchTerm.toLowerCase()) || 
     localTranslations.en[key as keyof typeof localTranslations.en]?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? "text-right" : "text-left"}`}>
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900" style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
            {isRTL ? "إدارة النصوص والترجمة" : "Manage Translations"}
          </h1>
          <p className="text-charcoal-500">
            {isRTL ? "تعديل كافة النصوص والكلمات المعروضة في الموقع." : "Edit all text and labels across the entire website."}
          </p>
        </div>
        <button 
          onClick={handleSave}
          className={`btn-primary py-2.5 px-5 rounded-xl shadow-lg shadow-burgundy-900/20 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Save className="w-4 h-4" />
          {isRTL ? "حفظ كافة التغييرات" : "Save All Changes"}
        </button>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-8 ${isRTL ? "flex-row-reverse" : ""}`}>
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
            <h3 className={`text-xs font-bold text-charcoal-400 uppercase tracking-widest mb-4 ${isRTL ? "text-right" : "text-left"}`}>
              {isRTL ? "الأقسام" : "Categories"}
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    activeCategory === cat.id 
                      ? "bg-burgundy-900 text-white shadow-md" 
                      : "text-charcoal-600 hover:bg-cream-50"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <span>{isRTL ? cat.name.ar : cat.name.en}</span>
                  <ChevronRight className={`w-4 h-4 opacity-50 ${isRTL ? "rotate-180" : ""}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Translation Fields */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm">
            <div className="relative">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400`} />
              <input 
                type="text" 
                placeholder={isRTL ? "ابحث عن كلمة معينة..." : "Search for a specific key or text..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"} py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900`}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredKeys.map((key) => (
              <div key={key} className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
                <div className={`flex items-center justify-between border-b border-cream-100 pb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-xs font-mono text-burgundy-900 font-bold bg-burgundy-50 px-2 py-0.5 rounded uppercase">
                    {key}
                  </span>
                  <Languages className="w-4 h-4 text-cream-300" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-4 h-3 bg-blue-600 rounded-sm" /> English
                    </label>
                    <textarea 
                      value={localTranslations.en[key as keyof typeof localTranslations.en] || ""}
                      onChange={(e) => handleUpdate("en", key, e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold text-charcoal-400 uppercase tracking-widest flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className="w-4 h-3 bg-emerald-600 rounded-sm" /> العربية
                    </label>
                    <textarea 
                      value={localTranslations.ar[key as keyof typeof localTranslations.ar] || ""}
                      onChange={(e) => handleUpdate("ar", key, e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 text-sm text-right resize-none font-tajawal"
                    />
                  </div>
                </div>
              </div>
            ))}

            {filteredKeys.length === 0 && (
              <div className="bg-white p-12 rounded-2xl border border-cream-200 text-center">
                <p className="text-charcoal-500 font-medium">No translation keys found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
