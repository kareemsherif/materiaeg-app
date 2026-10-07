import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck,
  AlertTriangle,
  Mail,
  Phone,
  Printer,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SEO from "@/components/layout/SEO";

export default function TermsPage() {
  const { lang, isRTL, setLang } = useLanguage();
  const [activeSection, setActiveSection] = useState("acceptance");

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
        { id: "acceptance", label: "١. قبول الشروط والأهلية" },
        { id: "services", label: "٢. نطاق الخدمات والكتالوج" },
        { id: "intellectual-property", label: "٣. الملكية الفكرية" },
        { id: "specifications", label: "٤. المواصفات الفنية والتفاوتات" },
        { id: "samples-orders", label: "٥. طلبات العينات والأسعار" },
        { id: "prohibited-use", label: "٦. الاستخدام المحظور" },
        { id: "third-party-links", label: "٧. خدمات الطرف الثالث" },
        { id: "disclaimer", label: "٨. إخلاء المسؤولية" },
        { id: "governing-law", label: "٩. القانون الحاكم والنزاعات" },
        { id: "updates-termination", label: "١٠. تعديل الشروط" },
        { id: "contact-legal", label: "١١. التواصل القانوني" },
      ]
    : [
        { id: "acceptance", label: "1. Acceptance of Terms" },
        { id: "services", label: "2. Scope of Services" },
        { id: "intellectual-property", label: "3. Intellectual Property" },
        { id: "specifications", label: "4. Technical Specifications" },
        { id: "samples-orders", label: "5. Samples & Quotations" },
        { id: "prohibited-use", label: "6. Prohibited Conduct" },
        { id: "third-party-links", label: "7. Third-Party Integrations" },
        { id: "disclaimer", label: "8. Disclaimer & Liability" },
        { id: "governing-law", label: "9. Governing Law" },
        { id: "updates-termination", label: "10. Modifications" },
        { id: "contact-legal", label: "11. Legal Contact" },
      ];

  return (
    <div className={`bg-cream-50 min-h-screen ${isRTL ? "text-right" : "text-left"}`}>
      <SEO
        title={lang === "ar" ? "الشروط والأحكام | ماتيريا" : "Terms & Conditions | MATERIA"}
        description={
          lang === "ar"
            ? "الشروط والأحكام العامة للتعامل وطلب عينات وتوريد خامات الجلد الصناعي من شركة ماتيريا."
            : "Terms and conditions for product orders, sample requests, and supply services from MATERIA."
        }
        canonical="https://materiaeg.com/terms"
        breadcrumbs={[
          { name: lang === "ar" ? "الرئيسية" : "Home", url: "/" },
          { name: lang === "ar" ? "شروط الاستخدام" : "Terms & Conditions", url: "/terms" },
        ]}
      />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-800 text-white pt-28 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-burgundy-900/30 via-transparent to-transparent opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className={`flex items-center gap-2 text-xs text-charcoal-400 mb-6 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <Link to="/" className="hover:text-cream-200 transition-colors">
              {isRTL ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-burgundy-300 font-medium">
              {isRTL ? "شروط الاستخدام" : "Terms of Use"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1
                className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4"
                style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
              >
                {isRTL ? "شروط وأحكام الاستخدام" : "Terms of Use & Service"}
              </h1>
              <p className="text-sm md:text-base text-charcoal-300 leading-relaxed max-w-2xl">
                {isRTL
                  ? "تحدد هذه الوثيقة الشروط المنظمة لاستخدامك لموقع وتطبيق ماتيريا (MATERIA) وخدمات توريد الجلود الصناعية وطلب العينات وعروض الأسعار وفقاً للقوانين المصرية المعمول بها."
                  : "These Terms of Use govern your access to and interaction with MATERIA's digital catalog, mobile application, sample dispatch, and quotation services."}
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
                <span>{isRTL ? "طباعة الشروط" : "Print Terms"}</span>
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
                <FileCheck className="w-4 h-4 text-burgundy-800" />
                <h3 className="text-sm font-bold text-charcoal-800">
                  {isRTL ? "فهرس الشروط" : "Table of Contents"}
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

          {/* Terms Content Body */}
          <main className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-charcoal-200/80 p-7 md:p-12 shadow-sm space-y-12">
            {/* 1. Acceptance */}
            <section id="acceptance" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "١. قبول الشروط والأهلية القانونية" : "1. Acceptance of Terms & Legal Capacity"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL ? (
                    <>
                      يُشكل دخولك إلى أو استخدامك لموقع <strong>ماتيريا (materiaeg.com)</strong> أو تطبيق الهاتف المحمول التابع لعلامة{" "}
                      <strong>MATERIA</strong> (المملوكة للشركة المصرية لإنتاج الجلود الصناعية ومشتقاتها - EPEI) موافقة صريحة منك على الالتزام بجميع بنود هذه الاتفاقية.
                    </>
                  ) : (
                    <>
                      By browsing, accessing, or utilizing the <strong>MATERIA website (materiaeg.com)</strong> or mobile application operated by the{" "}
                      <strong>Egyptian Company for Artificial Leather and Derivatives (EPEI)</strong>, you agree to be legally bound by these Terms of Use.
                    </>
                  )}
                </p>
                <p>
                  {isRTL
                    ? "تقر بأنك تملك الأهلية القانونية الكاملة للتعاقد (بلوغ سن الرشد القانوني 18 عاماً فأكثر في جمهورية مصر العربية)، أو أنك مفوض قانوناً لتمثيل شركتك أو مؤسستك التجارية في حال تقديم طلبات تجارية أو التعاقد نيابة عنها."
                    : "You certify that you possess the full legal capacity to enter into binding agreements or that you possess verified authorization to bind your enterprise."}
                </p>
              </div>
            </section>

            {/* 2. Scope of Services */}
            <section id="services" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٢. نطاق الخدمات والكتالوج الرقمي" : "2. Scope of Services & Digital Catalog"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "توفر منصات ماتيريا استعراضاً شاملاً لخامات الجلود الصناعية المصنعة من البولي فينيل كلوريد (PVC) والبولي يوريثان (PU) المخصصة لمختلف القطاعات الصناعية:"
                    : "MATERIA platforms provide an interactive digital showcase of engineered PVC and PU synthetic leather rolls tailored for industrial sectors:"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { en: "Automotive Interiors", ar: "فرش وديكورات السيارات" },
                    { en: "Luxury Furniture", ar: "الأثاث المنزلي والمكتبي" },
                    { en: "Footwear & Fashion", ar: "الأحذية والشنط والموضة" },
                    { en: "Healthcare & Hospitality", ar: "القطاع الطبي والضيافة" },
                  ].map((cat, i) => (
                    <div key={i} className="p-3 bg-charcoal-50 rounded-xl border border-charcoal-200 text-center font-medium text-charcoal-800">
                      {isRTL ? cat.ar : cat.en}
                    </div>
                  ))}
                </div>
                <p>
                  {isRTL
                    ? "تعتبر المعلومات والصور المعروضة بمثابة دعوة للتفاوض وطلب عروض أسعار تجارية، وليست عروض بيع نهائية ملزمة حتى يتم تأكيد أمر الشراء الرسمي والمواصفات الفنية المعتمدة كتابياً."
                    : "Product representations, technical sheets, and images serve as an invitation to treat and request custom commercial quotations, rather than binding retail offers, until an official written sales order is issued."}
                </p>
              </div>
            </section>

            {/* 3. Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٣. الملكية الفكرية والعلامات التجارية" : "3. Intellectual Property Rights"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL ? (
                    <>
                      جميع محتويات الموقع والتطبيق، بما في ذلك شعار <strong>MATERIA</strong>، والاسم التجاري، والنصوص، والتصاميم، والنقشات السطحية (Embossing Grains)، وصور الخامات، والكتالوجات، والرموز البرمجية، هي ملكية حصرية لـ{" "}
                      <strong>الشركة المصرية لإنتاج الجلود الصناعية ومشتقاتها</strong> ومحمية بموجب قوانين حماية الملكية الفكرية المصرية والمعاهدات الدولية.
                    </>
                  ) : (
                    <>
                      All intellectual property displayed across the website and mobile app, including the <strong>MATERIA</strong> emblem, trademarks, proprietary embossing grains, material photography, data sheets, and design, are the exclusive property of the{" "}
                      <strong>Egyptian Company for Artificial Leather and Derivatives (EPEI)</strong>.
                    </>
                  )}
                </p>
                <div className="p-3.5 bg-cream-100 border border-cream-300 rounded-xl text-xs md:text-sm text-charcoal-800 flex items-start gap-2.5">
                  <Ban className="w-4 h-4 text-burgundy-800 shrink-0 mt-0.5" />
                  <div>
                    <strong>{isRTL ? "حظر الاستنساخ غير المصرح به:" : "Unauthorized Reproduction Prohibited:"}</strong>{" "}
                    {isRTL
                      ? "يُحظر تماماً نسخ أو إعادة نشر أو استخراج بيانات (Scraping) أو هندسة عكسية لأي جزء من محتويات ماتيريا أو استخدامها لأغراض تجارية منافسة دون إذن كتابي مسبق ومعتمد."
                      : "Scraping, reverse engineering, or redistributing MATERIA catalog imagery, technical specs, or branding for competitive commercial endeavors without prior written authorization is strictly prohibited."}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Technical Specs & Industrial Tolerances */}
            <section id="specifications" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٤. المواصفات الفنية والتفاوتات الصناعية" : "4. Technical Specifications & Industrial Tolerances"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-4">
                <p>
                  {isRTL
                    ? "نظراً للطبيعة التصنيعية المتقدمة لخامات الجلود الصناعية ومراحل الطلاء والمعالجة الحرارية، تخضع المواصفات المعروضة للمعايير الصناعية التالية:"
                    : "Due to the coating and compounding stages inherent to artificial leather fabrication, all technical data are subject to standard industrial conventions:"}
                </p>

                <div className="space-y-2.5 text-xs md:text-sm">
                  <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-burgundy-800 shrink-0 mt-0.5" />
                    <div>
                      <strong>{isRTL ? "دقة الألوان والشاشات الرقمية:" : "Digital Color Reproduction:"}</strong>{" "}
                      {isRTL
                        ? "قد تختلف درجات الألوان المعروضة على الشاشات اختلافاً طفيفاً عن لون الرول الفعلي بسبب إعدادات سطوع الشاشة ونوعها. نوصي دوماً بطلب عينة فعلية قبل اعتماد الإنتاج الكمي."
                        : "Color tones displayed on screens may slightly deviate from physical rolls due to display calibrations. Clients are encouraged to evaluate physical swatches prior to volume batch runs."}
                    </div>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-burgundy-800 shrink-0 mt-0.5" />
                    <div>
                      <strong>{isRTL ? "تفاوتات السُمك والوزن (Tolerances):" : "Thickness & Grammage Tolerances:"}</strong>{" "}
                      {isRTL
                        ? "تخضع القياسات المحددة (مثل السُمك 0.8 مم، 1.2 مم، أو الوزن للغرام/م²) لتفاوت صناعي قياسي معتمد بنسبة (± 5% إلى 10%) وفق المعايير القياسية."
                        : "Stated metrics (e.g., thickness 0.8mm–1.4mm, weight gsm) are governed by standard industrial variances (± 5% to 10%) in compliance with industrial norms."}
                    </div>
                  </div>

                  <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-burgundy-800 shrink-0 mt-0.5" />
                    <div>
                      <strong>{isRTL ? "المقاومة والشهادات الخاصة:" : "Performance Ratings & Flame Retardancy:"}</strong>{" "}
                      {isRTL
                        ? "الخصائص الإضافية (مثل مقاومة الحريق، مقاومة الميكروبات، أو اختبارات الاحتكاك Martindale) يتم توفير شهادات فحص معملية معتمدة لها بناءً على الطلب."
                        : "Special features (anti-microbial, fire-retardancy, Martindale rub cycles) are accompanied by accredited factory test certificates upon customer request."}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Samples & Quotations */}
            <section id="samples-orders" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٥. طلبات العينات وعروض الأسعار" : "5. Sample Requests & Commercial Quotations"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "تلتزم ماتيريا بدعم عملائها من المصنعين والمهندسين وأصحاب الورش عبر سياسة العينات الميسرة:"
                    : "MATERIA supports industrial manufacturers, automotive upholsterers, and interior design firms through a structured sampling procedure:"}
                </p>
                <ul className="text-sm space-y-1.5 list-disc list-inside text-charcoal-700">
                  <li>
                    <strong>{isRTL ? "العينات المجانية:" : "Complimentary Swatches:"}</strong>{" "}
                    {isRTL
                      ? "نوفر كروت العينات الصغيرة مجاناً للشركات والمصانع المسجلة للتحقق من الملمس والبطانة وجودة الخامة."
                      : "Material swatches are provided free of charge to verified trade entities to inspect grain and substrate backing."}
                  </li>
                  <li>
                    <strong>{isRTL ? "عينات المتر ورولات التجارب:" : "Meterage & Prototype Rolls:"}</strong>{" "}
                    {isRTL
                      ? "طلبات الأمتار المحددة لإجراء تجارب التنجيد أو القص على خطوط الإنتاج تخضع لرسوم رمزية يُتفق عليها مسبقاً."
                      : "Cut-meter sampling for production-line prototypes or test upholstery is billed at agreed nominal rates."}
                  </li>
                  <li>
                    <strong>{isRTL ? "صلاحية عروض الأسعار:" : "Quotation Validity:"}</strong>{" "}
                    {isRTL
                      ? "نظراً لتقلبات أسعار الخامات البتروكيماوية وسعر الصرف، تكون عروض الأسعار سارية للمدة المحددة في الإشعار الرسمي الصادر من إدارة المبيعات."
                      : "Quotation validity periods are specified within formal sales memos."}
                  </li>
                </ul>
              </div>
            </section>

            {/* 6. Prohibited Conduct */}
            <section id="prohibited-use" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٦. الاستخدام المحظور والالتزامات" : "6. Prohibited Conduct & User Obligations"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "عند استخدام موقعنا أو تطبيقنا، فإنك تتعهد بعدم القيام بأي من الممارسات التالية:"
                    : "When utilizing our web or mobile interfaces, you explicitly covenant not to engage in:"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                  {[
                    {
                      ar: "استخدام أي برمجيات آلية (Bots/Crawlers) لجمع بيانات الموقع أو استنساخ صور الخامات.",
                      en: "Deploying automated scrapers, crawlers, or bots to harvest data or clone material texture assets.",
                    },
                    {
                      ar: "محاولة اختراق الخوادم أو تعطيل استقرار خدمات التطبيق أو التدخل في كود النظام.",
                      en: "Attempting vulnerability exploits, denial-of-service, or tampering with mobile app binaries.",
                    },
                    {
                      ar: "إرسال بيانات مضللة أو طلبات عينات وهمية أو انتحال شخصية جهات تجارية أخرى.",
                      en: "Submitting counterfeit quote inquiries, fictitious delivery addresses, or corporate impersonation.",
                    },
                    {
                      ar: "استخدام شعار ماتيريا لترويج منتجات مقلدة أو منسوبة للغير بغير حق.",
                      en: "Employing the MATERIA emblem to market imitation, counterfeit, or unverified fabrics.",
                    },
                  ].map((rule, idx) => (
                    <div key={idx} className="p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-burgundy-800 shrink-0 mt-0.5" />
                      <span className="text-charcoal-700">{isRTL ? rule.ar : rule.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Third-Party Integrations */}
            <section id="third-party-links" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٧. روابط وخدمات الطرف الثالث" : "7. Third-Party Integrations"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "قد تحتوي منصاتنا على روابط تحويلية لخدمات تابعة لشركات أخرى (مثل WhatsApp للتواصل السريع، أو خرائط Google للوصول إلى المصنع والإدارة). لا تتحمل ماتيريا أي مسؤولية عن سياسات تلك الجهات أو محتواها الخارجي، وتخضع تعاملاتك معها لشروطها الخاصة."
                    : "Our platforms integrate external service links (such as WhatsApp for instant messaging and Google Maps for directions). MATERIA does not bear responsibility for independent third-party server practices or privacy policies."}
                </p>
              </div>
            </section>

            {/* 8. Disclaimer & Limitations */}
            <section id="disclaimer" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٨. إخلاء المسؤولية وحدودها القانونية" : "8. Disclaimer & Limitation of Liability"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "يتم توفير الموقع والتطبيق الرقمي على أساس 'كما هو' و'كما هو متاح' دون أي ضمانات صريحة أو ضمنية بخلو الخدمة من الانقطاع المؤقت لأعمال الصيانة أو التحديث الدوري."
                    : "The website and mobile applications are provided on an 'as-is' and 'as-available' basis without warranties of uninterrupted uptime during scheduled maintenance."}
                </p>
                <p>
                  {isRTL
                    ? "إلى أقصى حد يسمح به القانون، لا تتحمل شركة ماتيريا أو مسؤولوها أي مسؤولية عن أي أضرار غير مباشرة أو خسائر ناجمة عن سوء استخدام الخامات خارج نطاق المواصفات الفنية الموصى بها من قبلنا."
                    : "To the maximum threshold permitted by law, MATERIA disclaims liability for damages resulting from improper material application beyond our certified technical guidelines."}
                </p>
              </div>
            </section>

            {/* 9. Governing Law */}
            <section id="governing-law" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "٩. القانون الحاكم والنزاعات القضائية" : "9. Governing Law & Dispute Resolution"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين واللوائح السارية في جمهورية مصر العربية."
                    : "These Terms of Use are governed by and construed in accordance with the substantive laws of Egypt."}
                </p>
                <p>
                  {isRTL
                    ? "في حالة حدوث أي نزاع ينشأ عن أو يرتبط بهذه الشروط أو باستخدام المنصة، يتم السعي أولاً لحله ودياً خلال ثلاثين (30) يوماً، وفي حال تعذر ذلك، تختص المحاكم الاقتصادية ومحاكم الإسكندرية / مدينة السادات بنظر النزاع بشكل حصري."
                    : "Any dispute arising out of these Terms shall first be pursued amicably within thirty (30) days. Failing conciliation, the commercial and economic courts of Alexandria or Sadat City, Egypt, shall exercise competent jurisdiction."}
                </p>
              </div>
            </section>

            {/* 10. Modifications */}
            <section id="updates-termination" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "١٠. تعديل الشروط والأحكام" : "10. Modifications to Terms"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-3">
                <p>
                  {isRTL
                    ? "تحتفظ شركة ماتيريا بحقها في تعديل أو تحديث هذه الشروط في أي وقت لمواكبة التطورات التجارية والصناعية. يُعتبر استمرار استخدامك لمنصاتنا بعد نشر الشروط المحدثة بمثابة قبول كامل لها."
                    : "MATERIA reserves the right to amend these Terms to ensure harmony with manufacturing standards. Continuing to browse our app or site confirms your acceptance of revised provisions."}
                </p>
              </div>
            </section>

            {/* 11. Legal Contact */}
            <section id="contact-legal" className="scroll-mt-24 space-y-4">
              <div className="pb-3 border-b border-charcoal-100">
                <h2 className="text-xl md:text-2xl font-bold text-charcoal-900">
                  {isRTL ? "١١. التواصل القانوني والإخطارات" : "11. Legal Contact & Notices"}
                </h2>
              </div>

              <div className="text-sm md:text-base text-charcoal-700 leading-relaxed space-y-4">
                <p>
                  {isRTL
                    ? "لأي إخطارات قانونية، أو استفسارات حول شروط الاستخدام وعقود التوريد الصناعية، يرجى مراسلة الدائرة القانونية والتجارية:"
                    : "For legal notices or commercial supply agreements, please address our legal & commercial department:"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 space-y-1.5">
                    <div className="flex items-center gap-2 text-burgundy-800 font-bold text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{isRTL ? "المراسلات الرسمية" : "Inquiries"}</span>
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
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
