import { useState, useEffect } from "react";
import { 
  Bell, 
  Send, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Users, 
  Sparkles,
  Info,
  RefreshCw,
  Image as ImageIcon,
  Key
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";

interface PushNotificationRecord {
  id: number;
  title: string;
  body: string;
  product_slug?: string;
  image_url?: string;
  topic: string;
  status: string;
  recipients_count: number;
  created_at: string;
}

export default function PushNotificationsPage() {
  const { lang, isRTL } = useLanguage();
  const { products } = useContent();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedProductSlug, setSelectedProductSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [topic, setTopic] = useState("all_users");

  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [history, setHistory] = useState<PushNotificationRecord[]>([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [configType, setConfigType] = useState<string>("none");
  const [showConfigModal, setShowConfigModal] = useState(false);

  const fetchHistoryAndStats = async () => {
    setFetchingHistory(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/send_push_notification.php", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setDeviceCount(data.device_count || 0);
        setFirebaseConfigured(!!data.firebase_configured);
        setConfigType(data.config_type || "none");
      }
    } catch (err) {
      console.error("Failed to load notifications history:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndStats();
  }, []);

  const handleProductSelect = (slug: string) => {
    setSelectedProductSlug(slug);
    if (slug) {
      const prod = products.find(p => p.slug === slug);
      if (prod) {
        if (!title) {
          setTitle(lang === "ar" ? `خامة جديدة متوفرة الآن: ${prod.name.ar}` : `New Material Arrival: ${prod.name.en}`);
        }
        if (!body) {
          setBody(lang === "ar" 
            ? `استكشف خامة ${prod.name.ar} كود (${prod.code}). اضغط هنا للاطلاع على المواصفات وطلب عينة.`
            : `Discover ${prod.name.en} (${prod.code}). Tap to view full technical specifications and request swatches.`);
        }
        if (prod.image && !imageUrl) {
          setImageUrl(prod.image.startsWith("http") ? prod.image : `https://materiaeg.com${prod.image.startsWith("/") ? "" : "/"}${prod.image}`);
        }
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء عنوان ونص الإشعار" : "Please fill in title and body");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/send_push_notification.php", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          body,
          productSlug: selectedProductSlug,
          imageUrl,
          topic
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(result.message || (lang === "ar" ? "تم إرسال الإشعار بنجاح" : "Notification sent successfully"));
        setTitle("");
        setBody("");
        setSelectedProductSlug("");
        setImageUrl("");
        fetchHistoryAndStats();
      } else {
        toast.error(result.error || (lang === "ar" ? "فشل إرسال الإشعار" : "Failed to send notification"));
      }
    } catch (err) {
      console.error(err);
      toast.error(lang === "ar" ? "حدث خطأ أثناء الاتصال بالخادم" : "Server communication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900" style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
            {isRTL ? "إشعارات تطبيق الموبايل" : "Mobile App Push Notifications"}
          </h1>
          <p className="text-charcoal-500 text-sm mt-1">
            {isRTL 
              ? "إرسال تنبيهات لحظية لمستخدمي تطبيق MATERIA على الهواتف مع ميزة الانتقال المباشر للخامة"
              : "Broadcast instant notifications to all MATERIA mobile app users with deep linking to materials"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="btn-outline text-xs inline-flex items-center gap-2 py-2 px-3"
          >
            <Key className="w-4 h-4 text-burgundy-900" />
            <span>{isRTL ? "إعدادات Firebase" : "Firebase Setup"}</span>
          </button>
          <button
            onClick={fetchHistoryAndStats}
            disabled={fetchingHistory}
            className="p-2 border border-cream-300 rounded-xl hover:bg-cream-100 transition-colors text-charcoal-600"
            title={isRTL ? "تحديث البيانات" : "Refresh"}
          >
            <RefreshCw className={`w-4 h-4 ${fetchingHistory ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-cream-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              {isRTL ? "الأجهزة النشطة" : "Registered Devices"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-burgundy-50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-burgundy-900" />
            </div>
          </div>
          <div className="text-3xl font-bold text-charcoal-900 mt-3 font-mono">
            {deviceCount}
          </div>
          <p className="text-xs text-charcoal-400 mt-1">
            {isRTL ? "تطبيق أندرويد وiOS مسجل" : "Registered Android & iOS apps"}
          </p>
        </div>

        <div className="bg-white border border-cream-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              {isRTL ? "حالة الربط مع Google" : "Firebase Status"}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${firebaseConfigured ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              {firebaseConfigured ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
          </div>
          <div className="text-lg font-bold text-charcoal-900 mt-3">
            {firebaseConfigured ? (isRTL ? "متصل (FCM جاهز)" : "Connected (FCM Active)") : (isRTL ? "وضع المحاكاة / قيد التجهيز" : "Ready / Simulation Mode")}
          </div>
          <p className="text-xs text-charcoal-400 mt-1">
            {configType === "service_account_v1" ? "FCM HTTP v1 (OAuth2)" : (configType === "server_key_legacy" ? "Legacy Server Key" : (isRTL ? "ملف JSON غير متصل" : "Service JSON not detected"))}
          </p>
        </div>

        <div className="bg-white border border-cream-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              {isRTL ? "إجمالي الإشعارات المرسلة" : "Total Broadcasts"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-charcoal-700" />
            </div>
          </div>
          <div className="text-3xl font-bold text-charcoal-900 mt-3 font-mono">
            {history.length}
          </div>
          <p className="text-xs text-charcoal-400 mt-1">
            {isRTL ? "حملة إشعار من لوحة التحكم" : "Broadcast campaigns recorded"}
          </p>
        </div>
      </div>

      {/* Main Grid: Composer & Phone Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white border border-cream-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-cream-200">
            <div className="w-8 h-8 rounded-lg bg-burgundy-900 text-white flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-charcoal-900">
              {isRTL ? "إنشاء إشعار فوري جديد" : "Compose New Push Notification"}
            </h2>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            {/* Quick Template Product Selection */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                {isRTL ? "ربط بالخامة / المنتج (اختياري للانتقال المباشر)" : "Link with Material (Deep Link - Optional)"}
              </label>
              <select
                value={selectedProductSlug}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              >
                <option value="">{isRTL ? "-- بدون توجيه لمنتج (إشعار عام) --" : "-- No Specific Product (General Announcement) --"}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {lang === "ar" ? p.name.ar : p.name.en} ({p.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-charcoal-400 mt-1">
                {isRTL 
                  ? "عند اختيار منتج، سيتم تعبئة العنوان والمحتوى تلقائياً، وسيفتح التطبيق صفحة المنتج فوراً عند النقر."
                  : "Selecting a material auto-populates fields and deep-links the notification directly to the product."}
              </p>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                {isRTL ? "الجمهور المستهدف (Topic)" : "Target Audience Topic"}
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              >
                <option value="all_users">{isRTL ? "جميع مستخدمي التطبيق (all_users)" : "All App Users (all_users)"}</option>
                <option value="new_materials">{isRTL ? "المهتمون بالخامات الجديدة (new_materials)" : "New Materials Enthusiasts (new_materials)"}</option>
                <option value="offers">{isRTL ? "عروض المصانع والورش (offers)" : "Wholesale Offers (offers)"}</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                {isRTL ? "عنوان الإشعار *" : "Notification Title *"}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isRTL ? "مثال: خامة جديدة ممتازة للأثاث والسيارات" : "e.g. New Luxury Upholstery Material Available"}
                className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                {isRTL ? "نص الإشعار *" : "Notification Body *"}
              </label>
              <textarea
                required
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isRTL ? "اكتب محتوى الرسالة الجذاب للمصانع والعملاء..." : "Enter compelling message for customers and workshops..."}
                className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
                {isRTL ? "رابط صورة الإشعار (اختياري)" : "Notification Image URL (Optional)"}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://materiaeg.com/product-images/..."
                  className="w-full bg-white border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute inset-y-0 end-3 text-xs text-charcoal-400 hover:text-charcoal-700"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !title.trim() || !body.trim()}
                className="btn-primary w-full justify-center py-3 text-sm font-bold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جاري الإرسال للبث..." : "Broadcasting..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isRTL ? "إرسال الإشعار الفوري لجميع الهواتف" : "Send Push Notification Now"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Phone Mockup: 5 cols */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-burgundy-900" />
            <span>{isRTL ? "معاينة حية على شاشة القفل" : "Live Lock Screen Preview"}</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[300px] bg-charcoal-950 rounded-[44px] p-3 shadow-2xl border-4 border-charcoal-800 relative">
            {/* Speaker & camera notch */}
            <div className="w-24 h-4 bg-charcoal-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-charcoal-950" />
              <div className="w-8 h-1 rounded-full bg-charcoal-800" />
            </div>

            {/* Screen Wallpaper */}
            <div className="w-full h-[480px] bg-gradient-to-b from-charcoal-900 via-charcoal-950 to-charcoal-900 rounded-[34px] overflow-hidden relative p-4 flex flex-col justify-between">
              {/* Top status bar */}
              <div className="flex items-center justify-between text-white text-[11px] font-mono px-2 pt-1 opacity-80">
                <span>12:00</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Clock on lockscreen */}
              <div className="text-center my-6 text-white">
                <div className="text-5xl font-light tracking-tight font-sans">12:00</div>
                <div className="text-xs text-charcoal-300 mt-1">Saturday, October 3</div>
              </div>

              {/* Push Notification Card Popup */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/20 text-charcoal-900 transition-all duration-300">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <img src="/materia-logo.png" alt="Materia" className="w-5 h-5 object-contain rounded-md bg-charcoal-900 p-0.5" />
                    <span className="text-[11px] font-bold tracking-wider text-charcoal-900">MATERIA</span>
                  </div>
                  <span className="text-[10px] text-charcoal-400">now</span>
                </div>

                <div className="text-xs font-bold text-charcoal-900 leading-snug line-clamp-1">
                  {title || (isRTL ? "عنوان الإشعار يظهر هنا..." : "Notification Title preview...")}
                </div>
                <div className="text-[11px] text-charcoal-600 mt-0.5 leading-snug line-clamp-2">
                  {body || (isRTL ? "نص الرسالة التسويقية أو تفاصيل الخامة الجديدة..." : "Notification message details preview...")}
                </div>

                {imageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden h-24 bg-cream-100 border border-cream-200">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {selectedProductSlug && (
                  <div className="mt-2 pt-1.5 border-t border-cream-200/60 flex items-center justify-between text-[10px] text-burgundy-900 font-semibold">
                    <span>{isRTL ? "انقر لفتح الخامة مباشرة" : "Tap to open material"}</span>
                    <span>→</span>
                  </div>
                )}
              </div>

              {/* Bottom bar indicator */}
              <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mb-1" />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-cream-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-burgundy-900" />
            <h3 className="text-base font-bold text-charcoal-900">
              {isRTL ? "سجل الإشعارات السابقة" : "Broadcast History"}
            </h3>
          </div>
          <span className="text-xs text-charcoal-400">
            {history.length} {isRTL ? "إشعار" : "records"}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400 text-sm">
            {isRTL ? "لم يتم إرسال أي إشعارات سابقة حتى الآن" : "No push notifications recorded yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-cream-100/70 text-charcoal-700 text-xs font-bold uppercase">
                <tr>
                  <th className="py-3 px-5">{isRTL ? "العنوان والمحتوى" : "Title & Body"}</th>
                  <th className="py-3 px-5">{isRTL ? "الخامة المربوطة" : "Linked Material"}</th>
                  <th className="py-3 px-5">{isRTL ? "القناة (Topic)" : "Audience"}</th>
                  <th className="py-3 px-5">{isRTL ? "الحالة" : "Status"}</th>
                  <th className="py-3 px-5">{isRTL ? "تاريخ الإرسال" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 text-charcoal-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-4 px-5 max-w-sm">
                      <div className="font-bold text-charcoal-900">{item.title}</div>
                      <div className="text-xs text-charcoal-500 mt-0.5 line-clamp-2">{item.body}</div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {item.product_slug ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono bg-burgundy-50 text-burgundy-900 px-2.5 py-1 rounded-lg">
                          {item.product_slug}
                        </span>
                      ) : (
                        <span className="text-xs text-charcoal-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap text-xs font-mono">
                      {item.topic}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {item.status === "sent" ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          {isRTL ? "مرسل بنجاح" : "Sent"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">
                          <Clock className="w-3 h-3" />
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap text-xs text-charcoal-400 font-mono">
                      {item.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Setup Guide Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-burgundy-900" />
                <h3 className="text-lg font-bold text-charcoal-900">
                  {isRTL ? "طريقة ربط وتفعيل Firebase Cloud Messaging" : "Firebase Cloud Messaging Setup Guide"}
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-charcoal-400 hover:text-charcoal-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-charcoal-600 space-y-3 leading-relaxed">
              <p>
                {isRTL 
                  ? "لإرسال إشعارات حقيقية لهواتف العملاء مباشرة من هذه اللوحة:" 
                  : "To dispatch real push notifications to client devices directly from this dashboard:"}
              </p>

              <ol className="list-decimal list-inside space-y-2 bg-cream-50 p-4 rounded-2xl border border-cream-200">
                <li>
                  <strong>{isRTL ? "الدخول إلى منصة Firebase Console" : "Go to Firebase Console"}:</strong><br />
                  <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-burgundy-900 underline inline-flex items-center gap-1 mt-0.5">
                    console.firebase.google.com <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <strong>{isRTL ? "إنشاء مفتاح Service Account" : "Generate Service Account Key"}:</strong><br />
                  {isRTL 
                    ? "من Project Settings > Service Accounts > اضغط Generate new private key."
                    : "Go to Project Settings > Service Accounts > Click 'Generate new private key'."}
                </li>
                <li>
                  <strong>{isRTL ? "رفع الملف في السيرفر" : "Place JSON file in API directory"}:</strong><br />
                  {isRTL 
                    ? "قم بإعادة تسمية الملف المحمّل إلى firebase_service_account.json وضعه داخل مجلد public/api/ في الموقع."
                    : "Rename downloaded file to firebase_service_account.json and place it inside public/api/."}
                </li>
                <li>
                  <strong>{isRTL ? "لتطبيق الموبايل (Flutter)" : "For Flutter Mobile App"}:</strong><br />
                  {isRTL 
                    ? "قم بتحميل ملف google-services.json وضعه داخل materia_app/android/app/."
                    : "Download google-services.json and place it inside materia_app/android/app/."}
                </li>
              </ol>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {isRTL
                    ? "تم تجهيز أكواد الـ API والـ Dashboard بالكامل للتعامل التلقائي مع الملف فور وضعه بدون الحاجة لتعديل أي سطر برمجي إضافي."
                    : "The API and dashboard are fully wired to auto-detect the credentials file as soon as placed."}
                </span>
              </div>
            </div>

            <div className="pt-2 text-end">
              <button
                onClick={() => setShowConfigModal(false)}
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                {isRTL ? "حسناً، فهمت" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
