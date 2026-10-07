import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  UserCheck,
  Server,
  Lock,
  Clock,
  Printer,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SEO from "@/components/layout/SEO";

export default function PrivacyPolicyPage() {
  const { lang, isRTL, setLang } = useLanguage();
  const [activeSection, setActiveSection] = useState("overview");

  const lastUpdated = isRTL ? "30 سبتمبر 2026" : "September 30, 2026";
  const Arrow = isRTL ? ChevronLeft : ChevronRight;

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const navItems = isRTL
    ? [
        { id: "overview", label: "١. نظرة عامة والجهة المسؤولة" },
        { id: "data-collected", label: "٢. البيانات التي نجمعها" },
        { id: "how-we-collect", label: "٣. كيف نجمع بياناتك" },
        { id: "purpose", label: "٤. أغراض استخدام البيانات" },
        { id: "third-party", label: "٥. خدمات الطرف الثالث" },
        { id: "cookies", label: "٦. ملفات تعريف الارتباط" },
        { id: "retention", label: "٧. مدة الاحتفاظ وأمان البيانات" },
        { id: "deletion", label: "٨. حقوق المستخدم وحذف البيانات" },
        { id: "children", label: "٩. خصوصية الأطفال" },
        { id: "legal-basis", label: "١٠. الامتثال القانوني" },
        { id: "changes", label: "١١. التحديثات والتعديلات" },
        { id: "contact", label: "١٢. بيانات التواصل" },
      ]
    : [
        { id: "overview", label: "1. Overview & Data Controller" },
        { id: "data-collected", label: "2. Information We Collect" },
        { id: "how-we-collect", label: "3. How We Collect Data" },
        { id: "purpose", label: "4. Purpose & Use of Data" },
        { id: "third-party", label: "5. Third-Party Services" },
        { id: "cookies", label: "6. Cookies & Local Storage" },
        { id: "retention", label: "7. Data Retention & Security" },
        { id: "deletion", label: "8. User Rights & Data Deletion" },
        { id: "children", label: "9. Children's Privacy" },
        { id: "legal-basis", label: "10. Compliance & Legal Basis" },
        { id: "changes", label: "11. Policy Changes" },
        { id: "contact", label: "12. Contact Information" },
      ];

  return (
    <div className={`bg-cream-50 min-h-screen ${isRTL ? "text-right" : "text-left"}`}>
      <SEO
        title={lang === "ar" ? "سياسة الخصوصية وحماية البيانات | ماتيريا" : "Privacy Policy & Data Protection | MATERIA"}
        description={
          lang === "ar"
            ? "سياسة الخصوصية وحماية البيانات لشركة ماتيريا للجلد الصناعي الفاخر وفق معايير GDPR ومتطلبات حماية البيانات."
            : "MATERIA's privacy policy and data protection practices in compliance with data protection laws."
        }
        canonical="https://materiaeg.com/privacy"
        breadcrumbs={[
          { name: lang === "ar" ? "الرئيسية" : "Home", url: "/" },
          { name: lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy", url: "/privacy" },
        ]}
      />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-800 text-white pt-28 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-burgundy-900/30 via-transparent to-transparent opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className={`flex items-center gap-2 text-xs text-charcoal-400 mb-6 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <Link to="/" className="hover:text-cream-200 transition-colors">
              {isRTL ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-burgundy-300 font-medium">
              {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1
                className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4"
                style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
              >
                {isRTL ? "سياسة الخصوصية وحماية البيانات" : "Privacy Policy & Data Protection"}
              </h1>
              <p className="text-sm md:text-base text-charcoal-300 leading-relaxed max-w-2xl">
                {isRTL
                  ? "تلتزم شركة ماتيريا (MATERIA) بحماية خصوصيتك وأمان بياناتك الشخصية عند استخدامك لموقعنا وتطبيق الهاتف المحمول، وفقاً لأعلى معايير الشفافية وحماية البيانات."
                  : "MATERIA is committed to safeguarding your privacy and personal data across our website and mobile application in accordance with leading privacy standards and transparency."}
              </p>
            </div>

            {/* Actions Card */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <div className="bg-charcoal-800/80 backdrop-blur border border-charcoal-700 rounded-xl p-4 text-xs text-charcoal-300 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-charcoal-400">{isRTL ? "آخر تحديث:" : "Last Updated:"}</span>
                  <span className="text-cream-200 font-medium">{lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-charcoal-400">{isRTL ? "اللغة:" : "Language:"}</span>
                  <button
                    onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                    className="text-burgundy-300 hover:text-burgundy-200 font-semibold underline underline-offset-2 transition-colors"
                  >
                    {isRTL ? "English" : "العربية"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-cream-200 text-xs font-medium border border-charcoal-600 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Printer className="w-4 h-4 text-burgundy-400" />
                <span>{isRTL ? "طباعة السياسة" : "Print Policy"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Table of Contents (Sidebar) */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 bg-white rounded-2xl border border-charcoal-200/80 p-5 shadow-sm">
              <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-charcoal-100 ${isRTL ? "flex-row-reverse" : ""}`}>
                <FileText className="w-4 h-4 text-burgundy-800" />
                <h3 className="text-sm font-bold text-charcoal-800">
                  {isRTL ? "فهرس السياسة" : "Table of Contents"}
                </h3>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className={`w-full text-xs font-medium px-3 py-2 rounded-lg transition-all flex items-center justify-between gap-2 ${
                        isRTL ? "text-right flex-row-reverse" : "text-left"
                      } ${
                        isActive
                          ? "bg-burgundy-50 text-burgundy-900 font-semibold"
                          : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <Arrow
                        className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isActive ? "text-burgundy-800 scale-110" : "text-charcoal-400 opacity-60"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Policy Text Content */}
          <main className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-charcoal-200/80 p-7 md:p-12 shadow-sm space-y-12">
            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "١. نظرة عامة وهوية الجهة المسؤولة" : "1. Overview & Data Controller"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL ? (
                    <>
                      تحرص علامة <strong>ماتيريا للجلود الصناعية الفاخرة (MATERIA)</strong>، التابعة لـ{" "}
                      <strong>الشركة المصرية لإنتاج الجلود الصناعية ومشتقاتها (EPEI)</strong>، المسجلة في جمهورية مصر العربية، على حماية خصوصية المستخدمين والعملاء والزوار.
                    </>
                  ) : (
                    <>
                      <strong>MATERIA Premium Artificial Leather</strong>, operated by the{" "}
                      <strong>Egyptian Company for Artificial Leather and Derivatives (EPEI)</strong>, registered in Egypt, is dedicated to safeguarding the privacy and personal data of our users, customers, and visitors.
                    </>
                  )}
                </p>
                <p>
                  {isRTL
                    ? "تسري هذه السياسة على موقعنا الإلكتروني (materiaeg.com)، وتطبيقاتنا للأجهزة الذكية (Materia Mobile App على نظامي Android و iOS)، وأي خدمات رقمية أو استفسارات أو نماذج لطلب عينات أو عروض أسعار تُقدَّم من خلالنا."
                    : "This Privacy Policy applies to our website (materiaeg.com), our mobile applications, quotation services, and sample requests."}
                </p>

                <div className="bg-cream-100 rounded-xl p-4 border border-cream-300 text-xs md:text-sm text-charcoal-800 space-y-1.5 mt-2">
                  <div className="font-semibold text-charcoal-900 mb-1">
                    {isRTL ? "بيانات المشغّل المسؤول عن البيانات:" : "Data Controller Contact:"}
                  </div>
                  <div><strong>{isRTL ? "الجهة القانونية:" : "Legal Entity:"}</strong> MATERIA / EPEI Co.</div>
                  <div><strong>{isRTL ? "المقر الإداري:" : "Administrative Office:"}</strong> 422 El-Gaish Rd, Porto Louran, Alexandria, Egypt</div>
                  <div><strong>{isRTL ? "المصانع والعمليات:" : "Manufacturing Facility:"}</strong> Western Extension, 8th Industrial Zone, Sadat City, El Monofeya, Egypt</div>
                  <div><strong>{isRTL ? "البريد الإلكتروني للخصوصية:" : "Privacy Contact Email:"}</strong> <a href="mailto:info@materiaeg.com" className="text-burgundy-800 underline">info@materiaeg.com</a></div>
                </div>
              </div>
            </section>

            {/* 2. Data Collected */}
            <section id="data-collected" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٢. البيانات التي نجمعها" : "2. Information We Collect"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-4">
                <p>
                  {isRTL
                    ? "نحن نجمع البيانات الضرورية فقط لتقديم وتطوير خدماتنا الصناعية والتجارية، وتنقسم إلى:"
                    : "We only collect data strictly necessary to deliver and enhance our industrial and commercial services. This is categorized into:"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-charcoal-50 p-4 rounded-xl border border-charcoal-200">
                    <h4 className="font-bold text-charcoal-900 text-sm mb-2 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-burgundy-800 shrink-0" />
                      <span>{isRTL ? "أ) بيانات تقدمها طواعية:" : "A) Directly Provided Data:"}</span>
                    </h4>
                    <ul className="text-xs md:text-sm text-charcoal-600 space-y-1.5 list-disc list-inside">
                      <li>{isRTL ? "الاسم الكامل واللقب المهني" : "Full name and professional title"}</li>
                      <li>{isRTL ? "اسم الشركة أو المصنع أو النشاط التجاري" : "Company / Workshop / Business name"}</li>
                      <li>{isRTL ? "عنوان البريد الإلكتروني ورقم الهاتف / الواتساب" : "Email address & phone / WhatsApp number"}</li>
                      <li>{isRTL ? "عنوان التوصيل لشحن عينات الخامات" : "Delivery address for material swatches"}</li>
                      <li>{isRTL ? "تفاصيل الطلبيات أو المواصفات الفنية المطلوبة" : "Product specifications and inquiry messages"}</li>
                    </ul>
                  </div>

                  <div className="bg-charcoal-50 p-4 rounded-xl border border-charcoal-200">
                    <h4 className="font-bold text-charcoal-900 text-sm mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4 text-burgundy-800 shrink-0" />
                      <span>{isRTL ? "ب) بيانات تُجمع تلقائياً:" : "B) Automatically Collected Data:"}</span>
                    </h4>
                    <ul className="text-xs md:text-sm text-charcoal-600 space-y-1.5 list-disc list-inside">
                      <li>{isRTL ? "عنوان بروتوكول الإنترنت (IP Address) والمنطقة التقريبية" : "IP address and approximate location"}</li>
                      <li>{isRTL ? "نوع الجهاز ونظام التشغيل (Android / iOS / Desktop)" : "Device model, OS version, and browser"}</li>
                      <li>{isRTL ? "سجلات الأداء وسرعة الاستجابة" : "App performance and error diagnostics"}</li>
                      <li>{isRTL ? "إحصاءات التصفح والصفحات الأكثر زيارة" : "Visited product pages and navigation paths"}</li>
                      <li>{isRTL ? "تفضيل اللغة المحفوظ محلياً" : "Language preference (AR/EN)"}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-cream-100 border border-cream-300 rounded-xl p-3.5 text-xs text-charcoal-700">
                  <strong>{isRTL ? "ملاحظة حول البيانات الحساسة:" : "Sensitive Data Notice:"}</strong>{" "}
                  {isRTL
                    ? "نحن لا نطلب ولا نجمع بأي شكل من الأشكال أي بيانات حساسة مثل المعلومات الدينية، العرقية، الصحية، أو بيانات بطاقات الدفع البنكية عبر الموقع أو التطبيق."
                    : "We do not request, process, or collect sensitive data such as health, religious beliefs, or credit card details via our website or application."}
                </div>
              </div>
            </section>

            {/* 3. How We Collect */}
            <section id="how-we-collect" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٣. كيف نجمع بياناتك" : "3. How We Collect Data"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "يتم جمع بياناتك من خلال الطرق المباشرة والواضحة التالية:"
                    : "Your data is collected transparently through the following touchpoints:"}
                </p>
                <ul className="space-y-2 text-sm text-charcoal-700 list-disc list-inside">
                  <li>
                    <strong>{isRTL ? "نماذج الاتصال وعروض الأسعار:" : "Contact & Quotation Forms:"}</strong>{" "}
                    {isRTL
                      ? "عندما تقوم بتعبئة نموذج (تواصل معنا) أو طلب عرض سعر أو طلب عينات مجانية."
                      : "When you submit a contact form, request a formal quote, or apply for material sample swatches."}
                  </li>
                  <li>
                    <strong>{isRTL ? "التواصل عبر WhatsApp والهاتف:" : "WhatsApp and Direct Phone Inquiries:"}</strong>{" "}
                    {isRTL
                      ? "عندما تختار الضغط على زر WhatsApp أو الاتصال بالخط الساخن (16870) لطلب استشارة فنية."
                      : "When initiating a WhatsApp conversation or calling our hotline (16870) for industrial consultation."}
                  </li>
                  <li>
                    <strong>{isRTL ? "استخدام تطبيق Materia للهاتف المحمول:" : "Using the Materia Mobile App:"}</strong>{" "}
                    {isRTL
                      ? "لتوفير سرعة المزامنة وعرض الكتالوج الإلكتروني واختيار الخامات بدون أي تسجيل دخول إجباري."
                      : "To synchronize catalogs and view material specs without mandatory account barriers."}
                  </li>
                  <li>
                    <strong>{isRTL ? "التحليلات التقنية القياسية:" : "Standard Technical Analytics:"}</strong>{" "}
                    {isRTL
                      ? "عبر خدمات التحليل المعيارية لتحسين أداء الخوادم وسرعة استجابة المنصة."
                      : "Via industry-standard telemetry to monitor server uptime and page responsiveness."}
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. Purpose of Use */}
            <section id="purpose" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٤. أغراض استخدام البيانات" : "4. Purpose & Use of Data"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "نستخدم البيانات المجمعة لأغراض تجارية وتشغيلية مشروعة فقط:"
                    : "We use collected data solely for legitimate business and operational purposes:"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      arTitle: "الرد على استفسارات العملاء",
                      enTitle: "Customer Inquiries & Quotations",
                      arDesc: "تجهيز عروض الأسعار والرد على الاستفسارات الفنية وإرسال كتالوجات وعينات الجلود الصناعية.",
                      enDesc: "Preparing price quotes, answering technical inquiries, and dispatching physical leather samples.",
                    },
                    {
                      arTitle: "تحسين التطبيق والموقع الإلكتروني",
                      enTitle: "App & Website Optimization",
                      arDesc: "فهم سلوك التصفح لإصلاح المشاكل البرمجية وتسريع تحميل صور الخامات عالية الدقة.",
                      enDesc: "Diagnosing technical bugs, accelerating high-res texture loading, and enhancing overall UX.",
                    },
                    {
                      arTitle: "الدعم الفني والخدمات الصناعية",
                      enTitle: "Technical Support & Guidance",
                      arDesc: "متابعة متطلبات مصانع الأثاث ومصنعي السيارات وورش التنجيد وتقديم المشورة الفنية.",
                      enDesc: "Providing material backing and grain recommendations to manufacturers.",
                    },
                    {
                      arTitle: "الأمان والامتثال القانوني",
                      enTitle: "Security & Legal Compliance",
                      arDesc: "حماية المنصة من الاستخدام غير المصرح به والامتثال للتشريعات التجارية السارية.",
                      enDesc: "Defending systems against fraudulent traffic and regulatory adherence.",
                    },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 bg-cream-50 rounded-xl border border-cream-200">
                      <div className="font-bold text-charcoal-900 text-sm mb-1">
                        {isRTL ? p.arTitle : p.enTitle}
                      </div>
                      <div className="text-xs text-charcoal-600 leading-relaxed">
                        {isRTL ? p.arDesc : p.enDesc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Third-Party Services */}
            <section id="third-party" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٥. خدمات الطرف الثالث" : "5. Third-Party Services"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-4">
                <p>
                  {isRTL
                    ? "قد نعتمد على خدمات طرف ثالث موثوقة لتشغيل منصاتنا وعرض الخرائط والخطوط والمراسلات:"
                    : "We integrate with trusted third-party providers to operate our platform features:"}
                </p>

                <div className="space-y-3">
                  <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-charcoal-900 text-sm">
                        Google Services & Firebase
                      </div>
                      <div className="text-xs text-charcoal-600 mt-0.5">
                        {isRTL
                          ? "تُستخدم لإرسال الإشعارات اللحظية ومراقبة استقرار التطبيق."
                          : "Used for push notifications and app telemetry."}
                      </div>
                    </div>
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-burgundy-800 hover:text-burgundy-900 font-semibold shrink-0"
                    >
                      <span>Google Privacy Policy</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-charcoal-900 text-sm">
                        WhatsApp (Meta Platforms)
                      </div>
                      <div className="text-xs text-charcoal-600 mt-0.5">
                        {isRTL
                          ? "عند النقر على زر المحادثة عبر WhatsApp، يتم توجيهك إلى تطبيق WhatsApp المشفر للتواصل المباشر."
                          : "Clicking our WhatsApp button launches Meta's encrypted messaging platform."}
                      </div>
                    </div>
                    <a
                      href="https://www.whatsapp.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-burgundy-800 hover:text-burgundy-900 font-semibold shrink-0"
                    >
                      <span>WhatsApp Privacy</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-cream-100 border border-cream-300 rounded-xl text-xs text-charcoal-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>{isRTL ? "التزام صريح بعدم بيع البيانات:" : "No Data Sale:"}</strong>{" "}
                    {isRTL
                      ? "نؤكد بشكل قاطع أن شركة ماتيريا لا تقوم ببيع أو تأجير أو تداول بياناتك الشخصية لأي جهات تسويقية خارجية على الإطلاق."
                      : "MATERIA strictly never sells or rents personal customer data to third-party advertisers."}
                  </span>
                </div>
              </div>
            </section>

            {/* 6. Cookies */}
            <section id="cookies" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٦. ملفات تعريف الارتباط والتخزين المحلي" : "6. Cookies & Local Storage"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "يستخدم موقعنا ملفات تعريف الارتباط وتقنيات التخزين المحلي للأغراض التشغيلية التالية:"
                    : "Our website utilizes functional cookies and web LocalStorage for operational purposes:"}
                </p>
                <ul className="text-sm space-y-1.5 list-disc list-inside text-charcoal-700">
                  <li>
                    <strong>{isRTL ? "تفضيلات اللغة:" : "Language Preference:"}</strong>{" "}
                    {isRTL
                      ? "حفظ خيارك بين اللغة العربية والإنجليزية لتجربة تصفح متسقة."
                      : "Remembering your chosen display language (AR/EN) across sessions."}
                  </li>
                  <li>
                    <strong>{isRTL ? "الملفات التقنية الأساسية:" : "Essential Tokens:"}</strong>{" "}
                    {isRTL
                      ? "تأمين جلسات التصفح وحماية النماذج من الهجمات الآلية."
                      : "Securing sessions and protecting inquiry forms against spam."}
                  </li>
                  <li>
                    <strong>{isRTL ? "إدارة الكوكيز:" : "Cookie Management:"}</strong>{" "}
                    {isRTL
                      ? "يمكنك في أي وقت تعطيل أو مسح ملفات تعريف الارتباط عبر متصفحك دون التأثير على تصفح الكتالوج."
                      : "You can disable cookies in your browser settings at any time without restricting catalog access."}
                  </li>
                </ul>
              </div>
            </section>

            {/* 7. Data Retention & Security */}
            <section id="retention" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٧. مدة الاحتفاظ وأمان البيانات" : "7. Data Retention & Security"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "نطبق إجراءات أمنية لحماية البيانات ضد الوصول غير المصرح به:"
                    : "We implement technical safeguards to protect data against unauthorized access:"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                  <div className="p-3.5 bg-charcoal-50 rounded-xl border border-charcoal-200 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-burgundy-800 shrink-0 mt-0.5" />
                    <div>
                      <strong>{isRTL ? "تشفير SSL/TLS المعتمد:" : "SSL/TLS Encryption:"}</strong>
                      <p className="text-charcoal-600 mt-1">
                        {isRTL
                          ? "جميع الاتصالات بين جهازك وخوادمنا مشفرة وفق بروتوكولات HTTPS الآمنة."
                          : "All communications between your device and our servers use HTTPS encryption."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-charcoal-50 rounded-xl border border-charcoal-200 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-burgundy-800 shrink-0 mt-0.5" />
                    <div>
                      <strong>{isRTL ? "مدة الاحتفاظ:" : "Retention Duration:"}</strong>
                      <p className="text-charcoal-600 mt-1">
                        {isRTL
                          ? "نحتفظ ببيانات الاستفسارات فقط للمدة اللازمة لإتمام المتابعة التجارية أو وفق القوانين المعمول بها."
                          : "Inquiries are retained only as long as necessary to fulfill commercial follow-up or statutory records."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Data Deletion & User Rights */}
            <section id="deletion" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٨. حقوق المستخدم وآلية حذف البيانات" : "8. User Rights & Data Deletion"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-4">
                <p>
                  {isRTL
                    ? "يحق لك في أي وقت طلب مسح أو تعديل أي بيانات شخصية مسجلة لدينا عبر الخطوات البسيطة التالية:"
                    : "You have the right to request deletion or modification of any personal information we hold via these simple steps:"}
                </p>

                <div className="bg-cream-50 p-4 rounded-xl border border-cream-300 space-y-2 text-xs md:text-sm">
                  <div className="font-semibold text-charcoal-900">
                    {isRTL ? "خطوات طلب حذف البيانات:" : "Steps to Request Deletion:"}
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-charcoal-700">
                    <li>
                      {isRTL ? "أرسل بريداً إلكترونياً إلى: " : "Send an email to: "}
                      <a href="mailto:info@materiaeg.com?subject=Data%20Deletion%20Request" className="font-mono font-bold text-burgundy-900 underline">
                        info@materiaeg.com
                      </a>
                    </li>
                    <li>
                      {isRTL
                        ? "اكتب في عنوان الرسالة: 'طلب حذف بيانات'."
                        : "Use email subject line: 'Data Deletion Request'."}
                    </li>
                    <li>
                      {isRTL
                        ? "اذكر اسمك ورقم هاتفك أو عنوان بريدك الإلكتروني المستخدم للتواصل."
                        : "Provide your name and phone number or email used during prior inquiries."}
                    </li>
                    <li>
                      {isRTL
                        ? "يتم تأكيد الطلب وحذف كافة السجلات المرتبطة من قواعد بياناتنا."
                        : "We will verify and purge all associated inquiry records from our database."}
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* 9. Children's Privacy */}
            <section id="children" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٩. خصوصية الأطفال" : "9. Children's Privacy"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "منتجات وخدمات ماتيريا موجهة لقطاعات الأعمال والصناعة (B2B) والجمهور البالغ من مصنعي الأثاث والسيارات. تطبيقنا وموقعنا غير موجهين للأطفال دون سن 13 عاماً."
                    : "MATERIA's products and applications are intended for industrial, B2B, and adult commercial audiences. We do not intentionally collect information from children under 13."}
                </p>
              </div>
            </section>

            {/* 10. Legal Compliance */}
            <section id="legal-basis" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "١٠. الامتثال القانوني" : "10. Legal Compliance"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "تلتزم هذه السياسة بأحكام قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020، ومبادئ الشفافية والمسؤولية في معالجة البيانات."
                    : "This policy complies with Egyptian Personal Data Protection Law No. 151 of 2020 and established international privacy principles."}
                </p>
              </div>
            </section>

            {/* 11. Policy Changes */}
            <section id="changes" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "١١. التحديثات والتعديلات على السياسة" : "11. Policy Updates"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "قد نقوم بتحديث سياسة الخصوصية هذه من حين لآخر لمواكبة التطورات الفنية أو التشريعية. عند إجراء أي تعديل، سنقوم بتحديث 'تاريخ آخر تحديث' في أعلى هذه الصفحة."
                    : "We may update this Privacy Policy periodically to reflect platform enhancements or statutory changes. Any updates will be reflected in the 'Last Updated' date above."}
                </p>
              </div>
            </section>

            {/* 12. Contact Information */}
            <section id="contact" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "١٢. بيانات الاتصال ومسؤول الخصوصية" : "12. Contact Information"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-4">
                <p>
                  {isRTL
                    ? "لأي استفسار بخصوص هذه السياسة أو بياناتك، يسعدنا تواصلك المباشر مع فريقنا:"
                    : "If you have any questions regarding this policy or your data, please contact our team:"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-burgundy-800 font-bold text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{isRTL ? "البريد الإلكتروني" : "Email"}</span>
                    </div>
                    <a
                      href="mailto:info@materiaeg.com"
                      className="text-xs md:text-sm text-charcoal-800 hover:text-burgundy-900 font-mono font-medium block underline"
                    >
                      info@materiaeg.com
                    </a>
                  </div>

                  <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-burgundy-800 font-bold text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{isRTL ? "الخط الساخن" : "Hotline"}</span>
                    </div>
                    <a
                      href="tel:16870"
                      className="text-xs md:text-sm text-charcoal-800 hover:text-burgundy-900 font-mono font-bold block"
                    >
                      16870 / +20 129 005 3380
                    </a>
                  </div>

                  <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 space-y-1.5 md:col-span-2">
                    <div className="flex items-center gap-2 text-burgundy-800 font-bold text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{isRTL ? "المقر الإداري والمصانع" : "Addresses"}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-charcoal-700">
                      <div>
                        <strong>{isRTL ? "الإدارة:" : "Administration:"}</strong>{" "}
                        {isRTL ? "٤٢٢ طريق الجيش، برج بورتو لوران، لوران، الإسكندرية، مصر" : "422 El-Gaish Rd, Porto Louran, Alexandria, Egypt"}
                      </div>
                      <div>
                        <strong>{isRTL ? "المصنع:" : "Factory:"}</strong>{" "}
                        {isRTL ? "الامتداد الغربي، قطعة ١٢، المنطقة الصناعية الثامنة، مدينة السادات، المنوفية" : "Western Extension, 8th Industrial Zone, Sadat City, El Monofeya, Egypt"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
