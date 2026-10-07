import { useState } from "react";
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink, Package } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import type { Product, ProductColor, ProductApplication } from "@/types";

export default function ManageProducts() {
  const { t, lang, isRTL } = useLanguage();
  const { products, deleteProduct, addProduct, updateProduct, applications } = useContent();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Product>({
    id: "",
    name: { en: "", ar: "" },
    slug: "",
    code: "",
    description: { en: "Premium quality artificial leather.", ar: "جلد صناعي فاخر عالي الجودة." },
    thickness: "",
    width: "137cm",
    materialType: { en: "", ar: "" },
    texture: { en: "Smooth", ar: "ناعم" },
    backing: { en: "T/C", ar: "بوليستر" },
    finish: { en: "Matte", ar: "مطفي" },
    waterResistance: { en: "High", ar: "عالية" },
    fireResistance: { en: "Optional", ar: "اختياري" },
    softnessLevel: { en: "Medium", ar: "متوسط" },
    image: "",
    galleryImages: [],
    colors: [],
    applications: [],
    categories: ["furniture"],
    isBestSeller: false,
    isNew: false
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit
        toast.error(isRTL ? "حجم الصورة كبير جداً (الأقصى 2 ميجابايت)" : "Image size too large (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.en.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.ar.includes(searchTerm) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: { en: "", ar: "" },
        slug: "",
        code: "",
        description: { en: "Premium quality artificial leather.", ar: "جلد صناعي فاخر عالي الجودة." },
        thickness: "",
        width: "137cm",
        materialType: { en: "", ar: "" },
        texture: { en: "Smooth", ar: "ناعم" },
        backing: { en: "T/C", ar: "بوليستر" },
        finish: { en: "Matte", ar: "مطفي" },
        waterResistance: { en: "High", ar: "عالية" },
        fireResistance: { en: "Optional", ar: "اختياري" },
        softnessLevel: { en: "Medium", ar: "متوسط" },
        image: "",
        galleryImages: [],
        colors: [
          { name: { en: "Black", ar: "أسود" }, hex: "#000000" },
          { name: { en: "Brown", ar: "بني" }, hex: "#4a3728" }
        ],
        applications: [],
        categories: ["furniture"],
        isBestSeller: false,
        isNew: false
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error(isRTL ? "يرجى رفع صورة للمنتج أولاً" : "Please upload a product image first");
      return;
    }

    const finalData = {
      ...formData,
      slug: formData.slug || formData.name.en.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || `product-${formData.id}`
    };

    if (editingProduct) {
      const ok = await updateProduct(finalData);
      if (ok) {
        toast.success(isRTL ? "تم تحديث المنتج بنجاح" : "Product updated successfully");
        setIsFormOpen(false);
      } else {
        toast.error(isRTL ? "فشل حفظ المنتج في قاعدة البيانات" : "Failed to save product to the database");
      }
    } else {
      const ok = await addProduct(finalData);
      if (ok) {
        toast.success(isRTL ? "تم إضافة المنتج بنجاح" : "Product added successfully");
        setIsFormOpen(false);
      } else {
        toast.error(isRTL ? "فشل حفظ المنتج في قاعدة البيانات" : "Failed to save product to the database");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) {
      const ok = await deleteProduct(id);
      if (ok) {
        toast.success(isRTL ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
      } else {
        toast.error(isRTL ? "فشل حذف المنتج من قاعدة البيانات" : "Failed to delete product from the database");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? "text-right" : "text-left"}`}>
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900" style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
            {isRTL ? "إدارة المنتجات" : "Manage Products"}
          </h1>
          <p className="text-charcoal-500">
            {isRTL ? "إضافة أو تعديل أو حذف المنتجات من الكتالوج الخاص بك." : "Add, edit, or remove products from your catalog."}
          </p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className={`btn-primary py-2.5 px-5 rounded-xl shadow-lg shadow-burgundy-900/20 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Plus className="w-4 h-4" />
          {isRTL ? "إضافة منتج جديد" : "Add New Product"}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400`} />
          <input 
            type="text" 
            placeholder={isRTL ? "بحث عن المنتجات بالاسم أو الكود..." : "Search products by name or code..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 bg-cream-50 border border-cream-200 rounded-lg focus:ring-2 focus:ring-burgundy-900/10 focus:border-burgundy-900 outline-none text-sm`}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-cream-200 rounded-lg text-sm font-medium text-charcoal-600 hover:bg-cream-50 transition-colors">
            <Filter className="w-4 h-4" />
            Category
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-cream-200 rounded-lg text-sm font-medium text-charcoal-600 hover:bg-cream-50 transition-colors">
            Status
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-50 border-b border-cream-100">
                <th className={`px-6 py-4 text-xs font-bold text-charcoal-500 uppercase tracking-widest ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "المنتج" : "Product"}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-charcoal-500 uppercase tracking-widest ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "الكود" : "Code"}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-charcoal-500 uppercase tracking-widest ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "السمك" : "Thickness"}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-charcoal-500 uppercase tracking-widest ${isRTL ? "text-right" : "text-left"}`}>
                  {isRTL ? "الحالة" : "Stock Status"}
                </th>
                <th className={`px-6 py-4 text-xs font-bold text-charcoal-500 uppercase tracking-widest ${isRTL ? "text-left" : "text-right"}`}>
                  {isRTL ? "إجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-cream-50/50 transition-colors">
                  <td className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <p className="text-sm font-bold text-charcoal-900">{isRTL ? product.name.ar : product.name.en}</p>
                        <p className="text-xs text-charcoal-500">{isRTL ? product.materialType.ar : product.materialType.en}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-cream-100 text-charcoal-700 px-2 py-1 rounded">
                      {product.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600">
                    {product.thickness}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      product.isBestSeller 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {product.isBestSeller ? "Best Seller" : "Standard"}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${isRTL ? "text-left" : "text-right"}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "justify-end"}`}>
                      <button className="p-2 text-charcoal-400 hover:text-burgundy-900 hover:bg-burgundy-50 rounded-lg transition-all" title={isRTL ? "عرض التفاصيل" : "View Details"}>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenForm(product)}
                        className="p-2 text-charcoal-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title={isRTL ? "تعديل" : "Edit"}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                        title={isRTL ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-cream-300 mx-auto mb-4" />
            <p className="text-charcoal-500 font-medium">No products found matching your search.</p>
          </div>
        )}

        <div className="p-4 bg-cream-50 border-t border-cream-100 flex items-center justify-between">
          <p className="text-xs text-charcoal-500">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-cream-200 rounded text-xs disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-cream-200 rounded text-xs disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* Product Form Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className={`bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${isRTL ? "text-right" : "text-left"}`}>
            <div className={`p-6 border-b border-cream-100 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
              <h2 className="text-xl font-bold text-charcoal-900" style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
                {editingProduct 
                  ? (isRTL ? "تعديل المنتج" : "Edit Product") 
                  : (isRTL ? "إضافة منتج جديد" : "Add New Product")}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-charcoal-400 hover:text-charcoal-900 transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "اسم المنتج (EN)" : "Product Name (EN)"}</label>
                  <input 
                    required
                    value={formData.name.en}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "اسم المنتج (AR)" : "Product Name (AR)"}</label>
                  <input 
                    required
                    value={formData.name.ar}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, ar: e.target.value}})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900 text-right font-tajawal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "كود المنتج" : "Product Code"}</label>
                  <input 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "السماكة" : "Thickness"}</label>
                  <input 
                    required
                    value={formData.thickness}
                    onChange={(e) => setFormData({...formData, thickness: e.target.value})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "صورة المنتج" : "Product Image"}</label>
                  <div className="flex items-center gap-4">
                    {formData.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0 border border-cream-200">
                        <img src={formData.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-xs text-charcoal-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-burgundy-50 file:text-burgundy-900 hover:file:bg-burgundy-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "نوع الخامة (EN)" : "Material Type (EN)"}</label>
                  <input 
                    required
                    value={formData.materialType.en}
                    onChange={(e) => setFormData({...formData, materialType: {...formData.materialType, en: e.target.value}})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "نوع الخامة (AR)" : "Material Type (AR)"}</label>
                  <input 
                    required
                    value={formData.materialType.ar}
                    onChange={(e) => setFormData({...formData, materialType: {...formData.materialType, ar: e.target.value}})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900 text-right font-tajawal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "الوصف (EN)" : "Description (EN)"}</label>
                  <textarea 
                    value={formData.description.en}
                    onChange={(e) => setFormData({...formData, description: {...formData.description, en: e.target.value}})}
                    rows={2}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "الوصف (AR)" : "Description (AR)"}</label>
                  <textarea 
                    value={formData.description.ar}
                    onChange={(e) => setFormData({...formData, description: {...formData.description, ar: e.target.value}})}
                    rows={2}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900 text-sm text-right font-tajawal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "العرض" : "Width"}</label>
                  <input 
                    value={formData.width}
                    onChange={(e) => setFormData({...formData, width: e.target.value})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "الملمس" : "Texture"}</label>
                  <input 
                    value={formData.texture.en}
                    onChange={(e) => setFormData({...formData, texture: {...formData.texture, en: e.target.value}})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">{isRTL ? "الخلفية" : "Backing"}</label>
                  <input 
                    value={formData.backing.en}
                    onChange={(e) => setFormData({...formData, backing: {...formData.backing, en: e.target.value}})}
                    className="w-full px-4 py-2 bg-cream-50 border border-cream-200 rounded-lg outline-none focus:border-burgundy-900"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">
                    {isRTL ? "الألوان المتاحة" : "Available Colors"}
                  </label>
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        colors: [...formData.colors, { name: { en: "New Color", ar: "لون جديد" }, hex: "#cccccc" }]
                      });
                    }}
                    className="text-xs font-bold text-burgundy-900 hover:text-burgundy-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {isRTL ? "إضافة لون" : "Add Color"}
                  </button>
                </div>
                
                <div className="space-y-3 bg-cream-50 p-4 rounded-2xl border border-cream-200">
                  {(formData.colors || []).map((color: ProductColor, index: number) => (
                    <div key={index} className={`flex items-center gap-3 bg-white p-3 rounded-xl border border-cream-100 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <input 
                        type="color" 
                        value={color.hex}
                        onChange={(e) => {
                          const newColors = [...formData.colors];
                          newColors[index].hex = e.target.value;
                          setFormData({...formData, colors: newColors});
                        }}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <input 
                          type="text" 
                          placeholder="EN Name"
                          value={color.name.en}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index] = { ...newColors[index], name: { ...newColors[index].name, en: e.target.value } };
                            setFormData({...formData, colors: newColors});
                          }}
                          className="px-3 py-1.5 bg-cream-50 border border-cream-200 rounded text-xs outline-none focus:border-burgundy-900"
                        />
                        <input 
                          type="text" 
                          placeholder="الاسم بالعربي"
                          value={color.name.ar}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index] = { ...newColors[index], name: { ...newColors[index].name, ar: e.target.value } };
                            setFormData({...formData, colors: newColors});
                          }}
                          className="px-3 py-1.5 bg-cream-50 border border-cream-200 rounded text-xs outline-none focus:border-burgundy-900 text-right"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const newColors = (formData.colors || []).filter((_: ProductColor, i: number) => i !== index);
                          setFormData({...formData, colors: newColors});
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(formData.colors || []).length === 0 && (
                    <p className="text-center text-xs text-charcoal-400 py-4 italic">
                      {isRTL ? "لا توجد ألوان مضافة بعد." : "No colors added yet."}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-charcoal-500 uppercase tracking-widest">
                  {isRTL ? "التطبيقات المتاحة (أين تستخدم هذه الخامة؟)" : "Available Applications (Where is this material used?)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-cream-50 p-4 rounded-2xl border border-cream-200 max-h-48 overflow-y-auto">
                  {applications.map((app: ProductApplication) => (
                    <label key={app.id} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={(formData.applications || []).includes(app.id)}
                        onChange={(e) => {
                          const currentApps = formData.applications || [];
                          const newApps = e.target.checked 
                            ? [...currentApps, app.id]
                            : currentApps.filter((id: string) => id !== app.id);
                          setFormData({...formData, applications: newApps});
                        }}
                        className="w-4 h-4 text-burgundy-900 rounded border-cream-300 focus:ring-burgundy-900/20"
                      />
                      <span className="text-xs text-charcoal-700 group-hover:text-burgundy-900 transition-colors">
                        {lang === "ar" ? app.name.ar : app.name.en}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`flex gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})}
                    className="w-4 h-4 text-burgundy-900 rounded"
                  />
                  <span className="text-sm text-charcoal-700">{isRTL ? "الأكثر مبيعاً" : "Best Seller"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isNew}
                    onChange={(e) => setFormData({...formData, isNew: e.target.checked})}
                    className="w-4 h-4 text-burgundy-900 rounded"
                  />
                  <span className="text-sm text-charcoal-700">{isRTL ? "منتج جديد" : "New Product"}</span>
                </label>
              </div>

              <div className={`pt-4 border-t border-cream-100 flex gap-3 ${isRTL ? "flex-row-reverse" : "justify-end"}`}>
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 rounded-xl border border-cream-200 text-charcoal-600 hover:bg-cream-50 transition-colors"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-burgundy-900 text-white hover:bg-burgundy-800 transition-colors shadow-lg shadow-burgundy-900/20"
                >
                  {isRTL ? "حفظ المنتج" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
