import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Download, Package, MessageCircle, ChevronRight, ChevronLeft,
  Droplets, Shield, Zap, Wind, Sparkles, Sun, Leaf, Layers,
  ArrowRight, ArrowLeft, Check, Phone
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import { APPLICATIONS } from "@/constants/data";
import ApplicationCard from "@/components/features/ApplicationCard";
import MaterialSelector from "@/components/features/MaterialSelector";
import SEO from "@/components/layout/SEO";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, isRTL } = useLanguage();
  const { products, settings } = useContent();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [showAllApps, setShowAllApps] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const generatePDF = async () => {
    setPdfLoading(true);
    try {
      const [{ default: jsPDF }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      // ─────────────────────────────────────────
      //  Page setup
      // ─────────────────────────────────────────
      const pdf  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W    = pdf.internal.pageSize.getWidth();   // 210 mm
      const H    = pdf.internal.pageSize.getHeight();  // 297 mm
      const ML   = 15;   // left margin
      const MR   = 15;   // right margin
      const BODY = W - ML - MR; // usable width = 180 mm

      const name  = product.name.en;
      const desc  = product.description?.en ?? "";

      // ─────────────────────────────────────────
      //  Helper: section heading with underline
      // ─────────────────────────────────────────
      const sectionHead = (text: string, y: number): number => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(100, 21, 27);
        pdf.text(text.toUpperCase(), ML, y);
        pdf.setDrawColor(100, 21, 27);
        pdf.setLineWidth(0.5);
        pdf.line(ML, y + 1.5, ML + BODY, y + 1.5);
        return y + 7; // return next Y
      };

      // ─────────────────────────────────────────
      //  HEADER BAR (burgundy strip)
      // ─────────────────────────────────────────
      pdf.setFillColor(100, 21, 27);
      pdf.rect(0, 0, W, 24, "F");

      // Logo text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("MATERIA", ML, 11);

      // Tagline below logo
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(220, 190, 180);
      pdf.text("Premium Artificial Leather", ML, 17.5);

      // Website top-right
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(220, 200, 195);
      pdf.text("www.materiaeg.com", W - MR, 11, { align: "right" });
      pdf.text("info@materiaeg.com", W - MR, 17, { align: "right" });

      // Thin accent line under header
      pdf.setFillColor(180, 50, 55);
      pdf.rect(0, 24, W, 1, "F");

      let Y = 32; // cursor starts after header

      // ─────────────────────────────────────────
      //  PRODUCT IMAGE + IDENTITY BLOCK
      // ─────────────────────────────────────────
      const IMG_W     = 72;   // image column width
      const IMG_H_MAX = 62;   // max image height
      const TEXT_X    = ML;
      const TEXT_W    = BODY - IMG_W - 6; // left text column

      // Load & embed image
      let imgPlaced = false;
      const imgSrc = product.image || "";
      if (imgSrc) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve) => {
            img.onload  = () => resolve();
            img.onerror = () => resolve();
            img.src = imgSrc.startsWith("http")
              ? imgSrc
              : `${window.location.origin}${imgSrc}`;
          });
          if (img.complete && img.naturalWidth > 0) {
            const c = document.createElement("canvas");
            c.width  = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext("2d")?.drawImage(img, 0, 0);
            const data  = c.toDataURL("image/jpeg", 0.88);
            const ratio = Math.min(IMG_W / img.naturalWidth, IMG_H_MAX / img.naturalHeight);
            const iW    = img.naturalWidth  * ratio;
            const iH    = img.naturalHeight * ratio;
            const iX    = W - MR - IMG_W + (IMG_W - iW) / 2; // centered in column
            // Light grey background behind image
            pdf.setFillColor(246, 242, 238);
            pdf.roundedRect(W - MR - IMG_W, Y, IMG_W, IMG_H_MAX, 2, 2, "F");
            pdf.addImage(data, "JPEG", iX, Y + (IMG_H_MAX - iH) / 2, iW, iH);
            imgPlaced = true;
          }
        } catch (_) { /* skip */ }
      }

      // Product code badge
      pdf.setFillColor(245, 235, 228);
      pdf.roundedRect(TEXT_X, Y, 28, 7, 1, 1, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 21, 27);
      pdf.text(product.code, TEXT_X + 14, Y + 4.8, { align: "center" });

      // Product name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(25, 20, 18);
      const nameLines = pdf.splitTextToSize(name, TEXT_W);
      pdf.text(nameLines, TEXT_X, Y + 13);

      // Description (max 4 lines)
      if (desc) {
        const descY = Y + 13 + nameLines.length * 5.5 + 3;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(90, 80, 75);
        const descLines = pdf.splitTextToSize(desc, TEXT_W);
        pdf.text(descLines.slice(0, 4), TEXT_X, descY);
      }

      Y += (imgPlaced ? IMG_H_MAX : 30) + 8;

      // ─────────────────────────────────────────
      //  TECHNICAL SPECIFICATIONS TABLE
      // ─────────────────────────────────────────
      Y = sectionHead("Technical Specifications", Y);

      const rows: [string, string][] = [
        ["Product Code",     product.code],
        ["Thickness",        product.thickness       ?? "—"],
        ["Width",            product.width           ?? "—"],
        ["Length / Roll",    "50 m"],
        ["Material Type",    product.materialType.en ?? "—"],
        ["Texture",          product.texture.en      ?? "—"],
        ["Backing",          product.backing.en      ?? "—"],
        ["Finish",           product.finish.en       ?? "—"],
        ["Water Resistance", product.waterResistance.en ?? "—"],
        ["Softness Level",   product.softnessLevel.en  ?? "—"],
      ];

      const ROW_H   = 8.5;
      const LABEL_W = 58;   // label column width
      const VAL_X   = ML + LABEL_W + 2;
      const VAL_W   = BODY - LABEL_W - 2;

      // Table outer border
      pdf.setDrawColor(200, 185, 175);
      pdf.setLineWidth(0.4);
      pdf.rect(ML, Y, BODY, rows.length * ROW_H, "S");

      rows.forEach(([label, value], i) => {
        const ry = Y + i * ROW_H;

        // Zebra fill
        if (i % 2 === 0) {
          pdf.setFillColor(252, 248, 245);
          pdf.rect(ML, ry, BODY, ROW_H, "F");
        }

        // Vertical separator between label and value
        pdf.setDrawColor(210, 195, 185);
        pdf.setLineWidth(0.2);
        pdf.line(ML + LABEL_W, ry, ML + LABEL_W, ry + ROW_H);

        // Horizontal row separator
        if (i < rows.length - 1) {
          pdf.line(ML, ry + ROW_H, ML + BODY, ry + ROW_H);
        }

        // Label (left, bold, slightly muted)
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.8);
        pdf.setTextColor(70, 60, 55);
        pdf.text(label, ML + 3, ry + ROW_H / 2 + 2.2);

        // Value (right of separator, normal weight)
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.8);
        pdf.setTextColor(25, 20, 18);
        pdf.text(value, VAL_X + 2, ry + ROW_H / 2 + 2.2);
      });

      Y += rows.length * ROW_H + 10;

      // ─────────────────────────────────────────
      //  AVAILABLE COLORS
      // ─────────────────────────────────────────
      if (product.colors && product.colors.length > 0) {
        Y = sectionHead("Available Colors", Y);

        const SW    = 10;   // swatch size
        const GAP   = 4;    // gap between swatches
        const STEP  = SW + GAP + 12; // horizontal step per swatch (swatch + label)
        const COLS  = Math.floor(BODY / STEP);
        let cx = ML;
        let cy = Y;

        product.colors.forEach((c, i) => {
          const hex = c.hex || "#BBBBBB";
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);

          // Swatch with border
          pdf.setFillColor(r, g, b);
          pdf.setDrawColor(160, 150, 140);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(cx, cy, SW, SW, 1.5, 1.5, "FD");

          // Color name below swatch (wrap if needed)
          const cName = (c.name?.en ?? "").slice(0, 18);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(5.8);
          pdf.setTextColor(65, 55, 50);
          pdf.text(cName, cx + SW / 2, cy + SW + 3.5, { align: "center", maxWidth: STEP - 2 });

          cx += STEP;
          if ((i + 1) % COLS === 0) {
            cx = ML;
            cy += SW + 10;
          }
        });

        Y = cy + SW + 14;
      }

      // ─────────────────────────────────────────
      //  FOOTER
      // ─────────────────────────────────────────
      // Thin top border
      pdf.setDrawColor(200, 185, 175);
      pdf.setLineWidth(0.3);
      pdf.line(ML, H - 16, W - MR, H - 16);

      // Footer strip
      pdf.setFillColor(248, 243, 239);
      pdf.rect(0, H - 15, W, 15, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 21, 27);
      pdf.text("MATERIA Egypt", ML, H - 8);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 90, 85);
      pdf.text(
        "Tel: 16870   |   info@materiaeg.com   |   www.materiaeg.com",
        W / 2, H - 8,
        { align: "center" }
      );

      // Page number
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.setTextColor(150, 135, 125);
      pdf.text("Page 1 of 1", W - MR, H - 8, { align: "right" });

      // ─────────────────────────────────────────
      //  SAVE
      // ─────────────────────────────────────────
      const safeName = name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
      pdf.save(`MATERIA_${product.code}_${safeName}.pdf`);

    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  const normalizeSlug = (s: string) => {
    let out = s;
    while (out.startsWith("favini-")) out = out.slice("favini-".length);
    return out;
  };


  const normalizedSlug = slug ? normalizeSlug(slug) : "";
  const product = products.find((p) => p.slug === slug || p.slug === normalizedSlug);

  // Redirect legacy /products/favini-... URLs to the clean slug (SEO + bookmarks)
  useEffect(() => {
    if (slug && product && slug !== product.slug) {
      navigate(`/products/${product.slug}`, { replace: true });
    }
  }, [slug, product, navigate]);

  // Reset gallery / color selection when navigating between products
  useEffect(() => {
    setActiveImg(0);
    setActiveColor(null);
    setShowAllApps(false);
    setInquirySent(false);
  }, [slug]);

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: "", phone: "", email: "", quantity: "", notes: "" });

  // Filter related products from the exact same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const sameCategory = products.filter((p) => {
      if (p.id === product.id || p.slug === product.slug) return false;
      if (product.categories && product.categories.length > 0) {
        return (p.categories || []).some((c) =>
          product.categories.some((pc) => pc.trim().toLowerCase() === c.trim().toLowerCase())
        );
      }
      return (
        p.materialType?.en?.toLowerCase() === product.materialType?.en?.toLowerCase()
      );
    });

    // Fallback if needed to fill up to 3 products
    const others = products.filter(
      (p) =>
        p.id !== product.id &&
        p.slug !== product.slug &&
        !sameCategory.some((sc) => sc.id === p.id)
    );

    return [...sameCategory, ...others].slice(0, 3);
  }, [product, products]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <SEO title={lang === "ar" ? "المنتج غير موجود | ماتيريا" : "Product Not Found | MATERIA"} noIndex={true} />
        <h2 className="text-2xl font-bold text-charcoal-900">{lang === "ar" ? "المنتج غير موجود" : "Product not found"}</h2>
        <Link to="/products" className="btn-primary">← {lang === "ar" ? "العودة للمنتجات" : "Back to Products"}</Link>
      </div>
    );
  }
  // Fallback: if galleryImages is empty, use the main product image
  const galleryImages = (product.galleryImages && product.galleryImages.length > 0) 
    ? product.galleryImages 
    : (product.image ? [product.image] : []);

  // Handle mixed applications data: some are strings like "car", some are objects like {en: "...", ar: "..."}
  const appIds = (product.applications || []).filter((a: unknown): a is string => typeof a === "string");
  const productApplications = APPLICATIONS.filter((a) => appIds.includes(a.id));
  const visibleApplications = showAllApps ? productApplications : productApplications.slice(0, 6);

  const selectedColor = activeColor !== null ? (product.colors || [])[activeColor] : undefined;
  const selectedHex = selectedColor?.hex || "";

  // White check is unreadable on light swatches → use dark check instead
  const isLightHex = (hex: string) => {
    const h = hex.replace("#", "");
    if (h.length !== 6) return false;
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.6;
  };

  const specRows = [
    { label: t("product.code"), value: product.code },
    { label: t("product.thickness"), value: product.thickness },
    { label: t("product.width"), value: product.width },
    { label: t("product.length"), value: "50 m / roll" },
    { label: t("product.material"), value: lang === "ar" ? product.materialType.ar : product.materialType.en },
    { label: t("product.texture"), value: lang === "ar" ? product.texture.ar : product.texture.en },
    { label: t("product.backing"), value: lang === "ar" ? product.backing.ar : product.backing.en },
    { label: t("product.finish"), value: lang === "ar" ? product.finish.ar : product.finish.en },
    { label: t("product.water"), value: lang === "ar" ? product.waterResistance.ar : product.waterResistance.en },
    { label: t("product.softness"), value: lang === "ar" ? product.softnessLevel.ar : product.softnessLevel.en },
  ];

  const whyFeatures = [
    { icon: Droplets, key: "why.waterproof", color: "text-blue-500" },
    { icon: Shield, key: "why.scratch", color: "text-emerald-500" },
    { icon: Zap, key: "why.softness", color: "text-amber-500" },
    { icon: Wind, key: "why.longevity", color: "text-purple-500" },
    { icon: Sparkles, key: "why.colors", color: "text-pink-500" },
    { icon: Sun, key: "why.uv", color: "text-orange-500" },
    { icon: Leaf, key: "why.eco", color: "text-green-500" },
    { icon: Layers, key: "why.flexible", color: "text-indigo-500" },
  ];

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const productName = lang === "ar" ? product.name.ar : product.name.en;
  const productDesc = (lang === "ar" ? (product.description?.ar || product.name.ar) : (product.description?.en || product.name.en)).trim();
  const productImageUrl = product.image.startsWith("http") ? product.image : `https://materiaeg.com${product.image.startsWith("/") ? "" : "/"}${product.image}`;

  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <SEO
        title={
          lang === "ar"
            ? `${product.name.ar} – خامة جلد صناعي فاخر (${product.code}) | ماتيريا`
            : `${product.name.en} – Premium Artificial Leather (${product.code}) | MATERIA`
        }
        description={
          lang === "ar"
            ? `${productDesc}. سماكة ${product.thickness}، عرض ${product.width}. خامة جلد صناعي عالي الجودة للأثاث والسيارات. اطلب عينات مجانية وتسعيرة الآن.`
            : `${productDesc}. Thickness: ${product.thickness}, Width: ${product.width}. Engineered PVC/PU artificial leather for upholstery & automotive. Request free swatches.`
        }
        ogType="product"
        ogImage={product.image}
        canonical={`https://materiaeg.com/products/${product.slug}`}
        breadcrumbs={[
          { name: lang === "ar" ? "الرئيسية" : "Home", url: "/" },
          { name: lang === "ar" ? "الخامات والمنتجات" : "Products", url: "/products" },
          { name: productName, url: `/products/${product.slug}` },
        ]}
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: productName,
          image: productImageUrl,
          description: productDesc,
          sku: product.code,
          mpn: product.code,
          brand: {
            "@type": "Brand",
            name: "MATERIA",
          },
          manufacturer: {
            "@type": "Organization",
            name: "MATERIA Premium Artificial Leather",
          },
          material: lang === "ar" ? product.materialType.ar : product.materialType.en,
          offers: {
            "@type": "Offer",
            url: `https://materiaeg.com/products/${product.slug}`,
            priceCurrency: "EGP",
            price: "0",
            priceValidUntil: "2027-12-31",
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: "MATERIA",
            },
          },
        }}
      />
      {/* Breadcrumb */}
      <div className="bg-cream-50 border-b border-cream-200">
        <div className={`max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-charcoal-400 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Link to="/" className="hover:text-charcoal-700 transition-colors">{t("nav.home")}</Link>
          {isRTL ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <Link to="/products" className="hover:text-charcoal-700 transition-colors">{t("nav.products")}</Link>
          {isRTL ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-charcoal-700 font-medium">{productName}</span>
        </div>
      </div>

      {/* ── SECTION 1: PRODUCT HERO ── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start ${isRTL ? "lg:grid-cols-2" : ""}`}>
            {/* Left: Images */}
            <div className={`${isRTL ? "order-2 lg:order-2" : "order-1"}`}>
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-200 border border-cream-300 mb-3">
                <img
                  key={galleryImages[activeImg] || product.image}
                  src={galleryImages[activeImg] || product.image}
                  alt={`${productName} - MATERIA Premium Leather`}
                  className="w-full h-full object-cover"
                />
                {/* Color tint: previews the selected color on the texture */}
                {selectedHex && (
                  <div
                    key={selectedHex}
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: selectedHex, mixBlendMode: "color" }}
                  />
                )}
                {product.isNew && (
                  <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"}`}>
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      {t("products.new")}
                    </span>
                  </div>
                )}
                {product.isBestSeller && (
                  <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"}`}>
                    <span className="badge-burgundy">★ {t("products.bestSeller")}</span>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all bg-cream-200 ${
                      activeImg === i ? "border-burgundy-900" : "border-cream-300"
                    }`}
                  >
                    <img src={img} alt={`${productName} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className={`${isRTL ? "order-1 lg:order-1" : "order-2"}`}>
              <h1
                className="text-3xl md:text-4xl font-bold text-charcoal-900 leading-tight mb-1"
                style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
              >
                {lang === "ar" ? product.name.ar : product.name.en}
              </h1>
              {lang === "en" ? (
                <p className="text-base text-charcoal-500 mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
                  {product.name.ar}
                </p>
              ) : (
                <p className="text-base text-charcoal-500 mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                  {product.name.en}
                </p>
              )}

              <p className="text-sm text-charcoal-600 leading-relaxed mb-6 border-b border-cream-200 pb-6">
                {lang === "ar" ? product.description.ar : product.description.en}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-0 mb-6">
                {specRows.map(({ label, value }) => (
                  <div key={label} className={`spec-row col-span-1 px-0 gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs text-charcoal-400 font-medium shrink-0">{label}</span>
                    <span className="text-xs font-bold text-charcoal-800 text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Colors */}
              <div className="mb-6">
                <div className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    {t("product.colors")}
                  </span>
                  <button className="text-xs text-burgundy-900 font-medium hover:underline">
                    {t("product.viewAllColors")}
                  </button>
                </div>
                <div className={`flex items-center gap-2 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                  {(product.colors || []).map((color, i) => (
                    <button
                      key={color.hex + i}
                      onClick={() => setActiveColor(activeColor === i ? null : i)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                        activeColor === i ? "border-burgundy-900 scale-110 shadow-md" : "border-cream-300"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={lang === "ar" ? color.name.ar : color.name.en}
                    >
                      {activeColor === i && (
                        <Check className={`absolute inset-0 m-auto w-3 h-3 drop-shadow ${isLightHex(color.hex) ? "text-charcoal-900" : "text-white"}`} />
                      )}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-xs text-charcoal-500 mt-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-cream-300 align-middle me-1"
                      style={{ backgroundColor: selectedColor.hex }}
                    />{" "}
                    {lang === "ar" ? selectedColor.name.ar : selectedColor.name.en}
                  </p>
                )}
              </div>

              {/* CTAs */}
              <div className={`grid grid-cols-2 gap-3 ${isRTL ? "" : ""}`}>
                <button
                  type="button"
                  onClick={() => setIsQuoteOpen(true)}
                  className="btn-primary justify-center col-span-2 py-3.5 shadow-md hover:shadow-lg"
                >
                  <Package className="w-4 h-4" />
                  {t("product.requestQuote")}
                </button>
                <button 
                  type="button"
                  onClick={generatePDF}
                  disabled={pdfLoading}
                  className={`btn-outline justify-center py-3 ${pdfLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  title={isRTL ? "تحميل مواصفات المنتج PDF" : "Download Product Specs PDF"}
                >
                  {pdfLoading ? (
                    <div className="w-4 h-4 border-2 border-burgundy-900/30 border-t-burgundy-900 rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {t("product.downloadPdf")}
                </button>
                <Link to="/contact" className="btn-outline justify-center py-3">
                  <Phone className="w-4 h-4" />
                  {t("product.requestSample")}
                </Link>
                <a
                  href={`https://wa.me/${settings.whatsapp || "201290053380"}?text=${encodeURIComponent(`Hello, I'm interested in ${product.code} – ${product.name.en}${selectedColor ? ` (${lang === "ar" ? selectedColor.name.ar : selectedColor.name.en})` : ""}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("product.whatsapp")}
                </a>
              </div>

              {inquirySent && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm font-medium animate-fade-in">
                  ✓ {t("contact.success")}
                </div>
              )}

              {/* Quote Request Modal */}
              {isQuoteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                  <div className={`bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-cream-200 ${isRTL ? "text-right" : "text-left"}`}>
                    <div className="flex items-center justify-between pb-4 border-b border-cream-200 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-charcoal-900" style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}>
                          {t("product.requestQuote")}
                        </h3>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          {product.code} – {lang === "ar" ? product.name.ar : product.name.en}
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsQuoteOpen(false)}
                        className="text-charcoal-400 hover:text-charcoal-700 p-1.5 rounded-full hover:bg-cream-100 text-xl font-bold leading-none"
                      >
                        ✕
                      </button>
                    </div>

                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setQuoteLoading(true);
                        try {
                          const res = await fetch("/api/send_message.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: quoteForm.name,
                              phone: quoteForm.phone,
                              email: quoteForm.email,
                              subject: `Quote Request: ${product.code} - ${product.name.en}`,
                              message: `Product: ${product.name.en} (${product.code})\nThickness: ${product.thickness}\nWidth: ${product.width}\nQuantity: ${quoteForm.quantity || 'Not specified'}\nNotes: ${quoteForm.notes || 'None'}`,
                              type: "quote"
                            })
                          });
                          const data = await res.json().catch(() => null);
                          if (res.ok && data?.success) {
                            setIsQuoteOpen(false);
                            setInquirySent(true);
                            setQuoteForm({ name: "", phone: "", email: "", quantity: "", notes: "" });
                            setTimeout(() => setInquirySent(false), 5000);
                            toast.success(isRTL ? "تم إرسال طلب عرض السعر بنجاح" : "Quote request sent successfully");
                          } else {
                            toast.error(data?.error || (isRTL ? "تعذر إرسال الطلب، يرجى المحاولة لاحقاً" : "Failed to send request, please try again"));
                          }
                        } catch (err) {
                          console.error("Quote submit error:", err);
                          toast.error(isRTL ? "حدث خطأ في الاتصال، يرجى التحقق من الشبكة" : "Network error, please check connection");
                        } finally {
                          setQuoteLoading(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          {isRTL ? "الاسم بالكامل *" : "Full Name *"}
                        </label>
                        <input
                          required
                          type="text"
                          value={quoteForm.name}
                          onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                          className="w-full border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                          placeholder={isRTL ? "اسمك أو اسم الشركة" : "Your name or company"}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                            {isRTL ? "رقم الهاتف *" : "Phone Number *"}
                          </label>
                          <input
                            required
                            type="tel"
                            value={quoteForm.phone}
                            onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                            className="w-full border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                            placeholder="+20 xxx xxx xxxx"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                            {isRTL ? "الكمية التقديرية (بالمتر / رول)" : "Estimated Quantity"}
                          </label>
                          <input
                            type="text"
                            value={quoteForm.quantity}
                            onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                            className="w-full border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                            placeholder={isRTL ? "مثال: 50 متر أو 2 رول" : "e.g. 50 meters"}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          {isRTL ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}
                        </label>
                        <input
                          type="email"
                          value={quoteForm.email}
                          onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                          className="w-full border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                          placeholder="name@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          {isRTL ? "ملاحظات إضافية" : "Additional Notes"}
                        </label>
                        <textarea
                          rows={3}
                          value={quoteForm.notes}
                          onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                          className="w-full border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
                          placeholder={isRTL ? "تفاصيل اللون أو الاستخدام..." : "Color preferences or application details..."}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsQuoteOpen(false)}
                          className="btn-outline flex-1 justify-center py-2.5 text-sm"
                        >
                          {isRTL ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                          type="submit"
                          disabled={quoteLoading}
                          className="btn-primary flex-1 justify-center py-2.5 text-sm"
                        >
                          {quoteLoading ? (isRTL ? "جاري الإرسال..." : "Sending...") : (isRTL ? "تأكيد الطلب" : "Submit Request")}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: APPLICATIONS (MOST IMPORTANT) ── */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-12 ${isRTL ? "text-right md:text-center" : ""}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1 bg-cream-300 max-w-16" />
              <div className="w-10 h-10 bg-burgundy-900 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="h-px flex-1 bg-cream-300 max-w-16" />
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-3"
              style={{
                fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif",
                color: "#7B1C2C",
              }}
            >
              {t("applications.title")}
            </h2>
            <p className="text-charcoal-500 text-sm max-w-xl mx-auto">{t("applications.subtitle")}</p>
          </div>

          {productApplications.length === 0 ? (
            <div className="text-center py-12 text-charcoal-400">
              {isRTL ? "لا توجد تطبيقات متاحة لهذه الخامة" : "No applications listed for this material"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {visibleApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
              {productApplications.length > 6 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowAllApps(!showAllApps)}
                    className="btn-outline inline-flex items-center gap-2"
                  >
                    {showAllApps
                      ? (isRTL ? "عرض أقل" : "Show Less")
                      : t("applications.viewMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── SECTION 3: WHY THIS MATERIAL ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-12 ${isRTL ? "text-right md:text-center" : ""}`}>
            <h2
              className="text-2xl md:text-3xl font-bold text-charcoal-900"
              style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
            >
              {t("why.title")}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {whyFeatures.map(({ icon: Icon, key, color }) => (
              <div
                key={key}
                className={`p-5 rounded-2xl border border-cream-200 hover:border-burgundy-200 hover:shadow-sm transition-all ${isRTL ? "text-right" : "text-left"}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center mb-3 ${isRTL ? "mr-auto" : ""}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h4 className="text-xs font-bold text-charcoal-900 mb-1">{t(key)}</h4>
                <p className="text-xs text-charcoal-500 leading-relaxed">{t(`${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: COLORS ── */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-10 ${isRTL ? "text-right md:text-center" : ""}`}>
            <h2
              className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-2"
              style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
            >
              {t("colors.title")}
            </h2>
            <p className="text-xs text-charcoal-400">{t("colors.custom")}</p>
          </div>

          <div className={`flex flex-wrap gap-4 justify-center mb-8`}>
            {(product.colors || []).map((color, i) => (
              <button
                key={color.hex + i}
                onClick={() => {
                  setActiveColor(activeColor === i ? null : i);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex flex-col items-center gap-2"
                title={lang === "ar" ? color.name.ar : color.name.en}
              >
                <div
                  className={`w-16 h-16 rounded-2xl shadow-md border-2 hover:scale-110 transition-transform cursor-pointer ${
                    activeColor === i ? "border-burgundy-900" : "border-cream-200"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className={`text-xs font-medium text-center max-w-16 leading-tight ${activeColor === i ? "text-burgundy-900 font-bold" : "text-charcoal-700"}`}>
                  {lang === "ar" ? color.name.ar : color.name.en}
                </span>
              </button>
            ))}
            {/* Custom */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-burgundy-300 flex items-center justify-center bg-burgundy-50 hover:bg-burgundy-100 transition-colors cursor-pointer">
                <span className="text-2xl">+</span>
              </div>
              <span className="text-xs font-medium text-burgundy-900 text-center">
                {isRTL ? "مخصص" : "Custom"}
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
              {t("colors.request")}
              <Arrow className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: MATERIAL SELECTOR ── */}
      <MaterialSelector />

      {/* Related Products */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`text-2xl font-bold text-charcoal-900 mb-8 ${isRTL ? "text-right" : ""}`}
            style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
          >
            {isRTL ? "منتجات ذات صلة" : "Related Materials"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="group flex gap-4 bg-white border border-cream-200 rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <img
                    src={p.image}
                    alt={lang === "ar" ? p.name.ar : p.name.en}
                    className="w-20 h-20 object-cover rounded-xl shrink-0"
                  />
                  <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : ""}`}>
                    <h4 className="text-sm font-bold text-charcoal-900 mb-1 truncate">
                      {lang === "ar" ? p.name.ar : p.name.en}
                    </h4>
                    <p className="text-xs text-charcoal-400 mb-2">{p.code}</p>
                    <div className={`flex items-center gap-1 text-xs text-burgundy-900 font-semibold group-hover:gap-2 transition-all ${isRTL ? "flex-row-reverse" : ""}`}>
                      {t("products.viewApplications")}
                      <Arrow className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
