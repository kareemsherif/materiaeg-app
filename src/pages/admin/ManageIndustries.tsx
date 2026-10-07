import { useState } from "react";
import { Plus, Search, Edit2, Trash2, LayoutGrid, Building2, X } from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";
import type { Industry } from "@/types";
import { toast } from "sonner";

const emptyForm = (): Industry => ({
  id: Math.random().toString(36).slice(2, 10),
  name: { en: "", ar: "" },
  description: { en: "", ar: "" },
  icon: "Building2",
  image: "",
  products: [],
  applications: [],
});

export default function ManageIndustries() {
  const { industries, updateIndustry, addIndustry, deleteIndustry } = useContent();
  const { isRTL, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Industry | null>(null);
  const [formData, setFormData] = useState<Industry>(emptyForm());
  const [saving, setSaving] = useState(false);

  const filtered = industries.filter(i =>
    i.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.name.ar.includes(searchTerm)
  );

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyForm());
    setIsFormOpen(true);
  };

  const openEdit = (industry: Industry) => {
    setEditing(industry);
    setFormData({ ...industry, name: { ...industry.name }, description: { ...industry.description }, products: [...industry.products], applications: [...industry.applications] });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.en.trim() || !formData.name.ar.trim()) {
      toast.error(isRTL ? "يرجى إدخال اسم القطاع باللغتين" : "Please enter the industry name in both languages");
      return;
    }
    setSaving(true);
    const ok = editing
      ? await updateIndustry(formData)
      : await addIndustry(formData);
    setSaving(false);
    if (ok) {
      toast.success(isRTL ? "تم حفظ القطاع بنجاح" : "Industry saved successfully");
      setIsFormOpen(false);
    } else {
      toast.error(isRTL ? "فشل حفظ القطاع في قاعدة البيانات" : "Failed to save industry to the database");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذا القطاع؟" : "Are you sure you want to delete this industry?")) return;
    const ok = await deleteIndustry(id);
    if (ok) {
      toast.success(isRTL ? "تم حذف القطاع بنجاح" : "Industry deleted successfully");
    } else {
      toast.error(isRTL ? "فشل حذف القطاع من قاعدة البيانات" : "Failed to delete industry from the database");
    }
  };

  const set = (patch: Partial<Industry>) => setFormData(prev => ({ ...prev, ...patch }));

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? "text-right" : "text-left"}`}>
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900" style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
            {isRTL ? "إدارة القطاعات" : "Manage Industries"}
          </h1>
          <p className="text-charcoal-500">
            {isRTL ? "التحكم في قطاعات الصناعة المعروضة على الموقع." : "Control the industrial sectors displayed on the website."}
          </p>
        </div>
        <button onClick={openAdd} className={`btn-primary py-2.5 px-5 rounded-xl shadow-lg shadow-burgundy-900/20 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Plus className="w-4 h-4" />
          {isRTL ? "إضافة قطاع جديد" : "Add New Industry"}
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400`} />
          <input
            type="text"
            placeholder={isRTL ? "بحث عن القطاعات..." : "Search industries..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"} py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 text-sm`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((industry) => (
          <div key={industry.id} className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden group">
            <div className="relative aspect-video bg-cream-100">
              {industry.image ? (
                <img src={industry.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-cream-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => openEdit(industry)} className="p-2 bg-white/90 hover:bg-white text-charcoal-900 rounded-lg shadow-lg transition-all" title={isRTL ? "تعديل" : "Edit"}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(industry.id)} className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg shadow-lg transition-all" title={isRTL ? "حذف" : "Delete"}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className={`p-6 ${isRTL ? "text-right" : "text-left"}`}>
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Building2 className="w-4 h-4 text-burgundy-900" />
                <h3 className="font-bold text-charcoal-900">
                  {lang === "ar" ? industry.name.ar : industry.name.en}
                </h3>
              </div>
              <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
                {lang === "ar" ? industry.description.ar : industry.description.en}
              </p>
              <div className={`mt-4 pt-4 border-t border-cream-100 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest flex items-center gap-1">
                  <LayoutGrid className="w-3 h-3" />
                  {industry.applications.length} Applications
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-20 text-center bg-white rounded-3xl border border-cream-200">
          <Building2 className="w-16 h-16 text-cream-200 mx-auto mb-4" />
          <p className="text-charcoal-500 font-medium">No industries found.</p>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsFormOpen(false)}>
          <form onSubmit={handleSave} onClick={(e) => e.stopPropagation()} className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-5 ${isRTL ? "text-right" : "text-left"}`}>
            <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
              <h2 className="text-xl font-bold text-charcoal-900">
                {editing ? (isRTL ? "تعديل القطاع" : "Edit Industry") : (isRTL ? "إضافة قطاع جديد" : "Add New Industry")}
              </h2>
              <button type="button" onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-cream-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-charcoal-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-600 mb-1.5">Name (EN) *</label>
                <input value={formData.name.en} onChange={(e) => set({ name: { ...formData.name, en: e.target.value } })} className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal-600 mb-1.5">الاسم (عربي) *</label>
                <input value={formData.name.ar} onChange={(e) => set({ name: { ...formData.name, ar: e.target.value } })} className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm text-right" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-600 mb-1.5">Description (EN)</label>
                <textarea value={formData.description.en} onChange={(e) => set({ description: { ...formData.description, en: e.target.value } })} rows={3} className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal-600 mb-1.5">الوصف (عربي)</label>
                <textarea value={formData.description.ar} onChange={(e) => set({ description: { ...formData.description, ar: e.target.value } })} rows={3} className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm resize-none text-right" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-600 mb-1.5">{isRTL ? "الأيقونة" : "Icon"}</label>
                <input value={formData.icon} onChange={(e) => set({ icon: e.target.value })} placeholder="Sofa, Car, Building2..." className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal-600 mb-1.5">{isRTL ? "رابط الصورة" : "Image URL"}</label>
                <input value={formData.image} onChange={(e) => set({ image: e.target.value })} placeholder="/product-images/..." className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm" dir="ltr" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-600 mb-1.5">{isRTL ? "معرّفات المنتجات المرتبطة (مفصولة بفاصلة)" : "Linked product IDs (comma-separated)"}</label>
              <input value={formData.products.join(", ")} onChange={(e) => set({ products: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="1, 2, 3" className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm" dir="ltr" />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-600 mb-1.5">{isRTL ? "التطبيقات (سطر لكل تطبيق)" : "Applications (one per line)"}</label>
              <textarea value={formData.applications.join("\n")} onChange={(e) => set({ applications: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} rows={4} className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl outline-none focus:border-burgundy-900 text-sm resize-none" />
            </div>

            <div className={`flex gap-3 pt-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 rounded-xl disabled:opacity-60">
                {saving ? (isRTL ? "جارٍ الحفظ..." : "Saving...") : (isRTL ? "حفظ القطاع" : "Save Industry")}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl border border-cream-200 text-charcoal-600 hover:bg-cream-50 transition-colors text-sm font-semibold">
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
