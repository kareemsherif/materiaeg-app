import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import SEO from "@/components/layout/SEO";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

export default function ContactPage() {
  const { t, lang, isRTL } = useLanguage();
  const { settings } = useContent();

  const whatsapp = settings.whatsapp || "201000000000";
  const email = settings.email || "info@materiaeg.com";
  const hotline = settings.hotline || "16870";
  const address1 = settings.address || t("contact.address1");
  const address2 = settings.address2 || t("contact.address2");
  const mapEmbed = settings.map_embed || "";

  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", company: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/send_message.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          company: form.company,
          message: form.message,
          type: "contact"
        })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setSubmitted(true);
        setForm({ name: "", email: "", phone: "", company: "", message: "" });
        toast.success(isRTL ? "تم إرسال رسالتك بنجاح" : "Message sent successfully");
      } else {
        toast.error(data?.error || (isRTL ? "تعذر إرسال الرسالة، يرجى المحاولة لاحقاً" : "Failed to send message, please try again"));
      }
    } catch (err) {
      console.error("Message send error:", err);
      toast.error(isRTL ? "حدث خطأ في الاتصال، يرجى التحقق من الشبكة" : "Network error, please check connection");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: isRTL ? "الإدارة (Administration)" : "Administration",
      value: address1,
      href: `https://maps.google.com/?q=${encodeURIComponent(address1)}`,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      icon: MapPin,
      label: isRTL ? "المصنع (Factory)" : "Factory",
      value: address2,
      href: `https://maps.google.com/?q=${encodeURIComponent(address2)}`,
      color: "text-orange-700",
      bg: "bg-orange-50",
    },
    {
      icon: Phone,
      label: isRTL ? "الخط الساخن (Hotline)" : "Hotline",
      value: hotline,
      href: `tel:${hotline}`,
      color: "text-burgundy-900",
      bg: "bg-burgundy-50",
    },
    {
      icon: Mail,
      label: isRTL ? "البريد الإلكتروني (Email)" : "Email",
      value: email,
      href: `mailto:${email}`,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      icon: Globe,
      label: isRTL ? "الموقع الإلكتروني (Website)" : "Website",
      value: "www.materiaeg.com",
      href: "https://www.materiaeg.com",
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
    {
      icon: Clock,
      label: isRTL ? "ساعات العمل" : "Working Hours",
      value: t("contact.hours"),
      href: null,
      color: "text-charcoal-700",
      bg: "bg-cream-100",
    },
  ];

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <SEO
        title={lang === "ar" ? "تواصل معنا | طلب عينات مجانية وتسعير خامات الجلد – ماتيريا" : "Contact MATERIA | Request Leather Samples & Wholesale Quotes"}
        description={
          lang === "ar"
            ? "تواصل مع فريق مبيعات ماتيريا لطلب عينات مجانية، استشارات فنية، أو عروض أسعار جملة للمصانع والورش. الخط الساخن: 16870، الإسكندرية ومدينة السادات."
            : "Get in touch with MATERIA sales team for free artificial leather swatches, technical advice, or wholesale B2B inquiries. Hotline: 16870."
        }
        canonical="https://materiaeg.com/contact"
        breadcrumbs={[
          { name: lang === "ar" ? "الرئيسية" : "Home", url: "/" },
          { name: lang === "ar" ? "تواصل معنا" : "Contact", url: "/contact" },
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: lang === "ar" ? "تواصل مع ماتيريا" : "Contact MATERIA",
          description: "MATERIA Customer Service, Sample Requests, and Sales Inquiries",
          mainEntity: {
            "@type": "Organization",
            name: "MATERIA Premium Artificial Leather",
            telephone: "+20-16870",
            email: email,
            address: {
              "@type": "PostalAddress",
              streetAddress: address1,
              addressLocality: "Alexandria",
              addressCountry: "EG",
            },
          },
        }}
      />
      {/* Page Header */}
      <section className="bg-charcoal-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-leather opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className={`flex items-center gap-2 text-xs text-charcoal-400 mb-4 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <Link to="/" className="hover:text-cream-200 transition-colors">{t("nav.home")}</Link>
            <span>/</span>
            <span className="text-cream-200">{t("nav.contact")}</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {t("contact.title")}
          </h1>
          <p className="text-charcoal-300 text-base">{t("contact.subtitle")}</p>
        </div>
      </section>

      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid grid-cols-1 lg:grid-cols-5 gap-10 ${isRTL ? "" : ""}`}>
            {/* Contact Info */}
            <div className={`lg:col-span-2 space-y-4 ${isRTL ? "order-2 lg:order-2" : "order-2 lg:order-1"}`}>
              {contactInfo.map(({ icon: Icon, label, value, href, color, bg }, i) => (
                <div key={i} className={`bg-white rounded-2xl p-5 border border-cream-200 hover:shadow-sm transition-all ${isRTL ? "text-right" : ""}`}>
                  <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-charcoal-400 uppercase tracking-wider mb-1">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="text-sm text-charcoal-800 hover:text-burgundy-900 transition-colors font-medium break-all"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-charcoal-700 font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-3 text-sm whatsapp-pulse"
              >
                <MessageCircle className="w-5 h-5" />
                {t("contact.whatsapp")}
              </a>

              {/* Map embed — URL controlled from Admin › Site Settings */}
              <div className="bg-cream-200 rounded-2xl overflow-hidden aspect-video">
                {mapEmbed ? (
                  <iframe
                    src={mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="MATERIA Location"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-charcoal-400">
                    <MapPin className="w-8 h-8 opacity-40" />
                    <p className="text-xs text-center px-4">
                      {isRTL ? "لم يتم تعيين رابط الخريطة بعد" : "Map URL not configured yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className={`lg:col-span-3 ${isRTL ? "order-1 lg:order-1" : "order-1 lg:order-2"}`}>
              <div className="bg-white rounded-3xl border border-cream-200 shadow-sm p-8">
                <h2
                  className="text-2xl font-bold text-charcoal-900 mb-2"
                  style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
                >
                  {isRTL ? "أرسل لنا رسالة" : "Send Us a Message"}
                </h2>
                <p className="text-sm text-charcoal-500 mb-7">
                  {isRTL ? "سنرد عليك خلال ٢٤ ساعة" : "We'll respond within 24 hours"}
                </p>

                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal-900">
                      {isRTL ? "تم الإرسال!" : "Message Sent!"}
                    </h3>
                    <p className="text-charcoal-500 text-sm">{t("contact.success")}</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-outline mt-2 text-sm py-2 px-5"
                    >
                      {isRTL ? "إرسال رسالة أخرى" : "Send Another"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wide">
                          {t("contact.name")} *
                        </label>
                        <input
                          required
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={`w-full border border-cream-300 rounded-xl px-4 py-3 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-500 bg-cream-50 transition-all ${isRTL ? "text-right" : ""}`}
                          placeholder={isRTL ? "الاسم الكامل" : "Your full name"}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wide">
                          {t("contact.phone")} *
                        </label>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className={`w-full border border-cream-300 rounded-xl px-4 py-3 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-500 bg-cream-50 transition-all ${isRTL ? "text-right" : ""}`}
                          placeholder={isRTL ? "رقم هاتفك" : "+20 xxx xxx xxxx"}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wide">
                        {t("contact.email")} *
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`w-full border border-cream-300 rounded-xl px-4 py-3 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-500 bg-cream-50 transition-all ${isRTL ? "text-right" : ""}`}
                        placeholder="email@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wide">
                        {t("contact.company")}
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className={`w-full border border-cream-300 rounded-xl px-4 py-3 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-500 bg-cream-50 transition-all ${isRTL ? "text-right" : ""}`}
                        placeholder={isRTL ? "اسم شركتك" : "Your company name"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 uppercase tracking-wide">
                        {t("contact.message")} *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={`w-full border border-cream-300 rounded-xl px-4 py-3 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-burgundy-300 focus:border-burgundy-500 bg-cream-50 resize-none transition-all ${isRTL ? "text-right" : ""}`}
                        placeholder={
                          isRTL
                            ? "أخبرنا عن مشروعك، نوع الخامة المطلوبة، الكميات، وأي متطلبات خاصة..."
                            : "Tell us about your project, required material, quantities, and any special requirements..."
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full btn-primary justify-center py-4 text-sm ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t("contact.send")}
                        </>
                      )}
                    </button>

                    <p className={`text-xs text-charcoal-500 text-center leading-relaxed mt-2 ${isRTL ? "text-right" : "text-left"}`}>
                      {isRTL ? (
                        <>
                          بإرسال هذا النموذج، فإنك توافق على{" "}
                          <Link to="/privacy" className="text-burgundy-900 underline font-medium hover:text-burgundy-700">
                            سياسة الخصوصية
                          </Link>{" "}
                          و{" "}
                          <Link to="/terms" className="text-burgundy-900 underline font-medium hover:text-burgundy-700">
                            شروط الاستخدام
                          </Link>{" "}
                          الخاصة بشركة ماتيريا.
                        </>
                      ) : (
                        <>
                          By submitting this form, you acknowledge and agree to our{" "}
                          <Link to="/privacy" className="text-burgundy-900 underline font-medium hover:text-burgundy-700">
                            Privacy Policy
                          </Link>{" "}
                          and{" "}
                          <Link to="/terms" className="text-burgundy-900 underline font-medium hover:text-burgundy-700">
                            Terms of Use
                          </Link>.
                        </>
                      )}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
