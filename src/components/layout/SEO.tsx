import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const SITE_URL = "https://materiaeg.com";
const DEFAULT_IMAGE = `${SITE_URL}/materia-logo.png`;

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  breadcrumbs,
  schema,
}: SEOProps) {
  const { lang } = useLanguage();
  const location = useLocation();

  const fullCanonical = canonical || `${SITE_URL}${location.pathname === "/" ? "" : location.pathname}`;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;

  const defaultTitle =
    lang === "ar"
      ? "ماتيريا – خامات جلد صناعي فاخر ومصنع جلود | MATERIA"
      : "MATERIA – Premium Artificial Leather Manufacturer | Egypt";

  const defaultDesc =
    lang === "ar"
      ? "ماتيريا الشركة الرائدة في مصر لتصنيع وتوريد خامات الجلد الصناعي عالي الجودة للأثاث، السيارات، الموضة، والفنادق. مصانعنا بالإسكندرية ومدينة السادات."
      : "MATERIA is Egypt's leading manufacturer of high-performance PVC & PU artificial leather for furniture, automotive, fashion, hospitality, and healthcare.";

  const finalTitle = title ? (title.includes("MATERIA") || title.includes("ماتيريا") ? title : `${title} | MATERIA`) : defaultTitle;
  const finalDesc = description || defaultDesc;

  useEffect(() => {
    // 1. Update Title
    document.title = finalTitle;

    // Helper to update or create meta tag
    const setMetaTag = (attrName: "name" | "property", attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Standard Meta
    setMetaTag("name", "description", finalDesc);
    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }
    setMetaTag("name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // 3. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", fullCanonical);

    // 4. Open Graph
    setMetaTag("property", "og:title", finalTitle);
    setMetaTag("property", "og:description", finalDesc);
    setMetaTag("property", "og:url", fullCanonical);
    setMetaTag("property", "og:image", fullOgImage);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:locale", lang === "ar" ? "ar_EG" : "en_US");
    setMetaTag("property", "og:site_name", "MATERIA Premium Artificial Leather");

    // 5. Twitter Card
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", finalTitle);
    setMetaTag("name", "twitter:description", finalDesc);
    setMetaTag("name", "twitter:image", fullOgImage);

    // 6. Dynamic JSON-LD Structured Data
    const schemaScripts: HTMLScriptElement[] = [];

    // Helper to inject JSON-LD
    const injectJSONLD = (id: string, data: object) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = id;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
      schemaScripts.push(script);
    };

    // Breadcrumbs Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: crumb.name,
          item: crumb.url.startsWith("http") ? crumb.url : `${SITE_URL}${crumb.url}`,
        })),
      };
      injectJSONLD("seo-breadcrumbs-schema", breadcrumbData);
    } else {
      const oldBreadcrumbs = document.getElementById("seo-breadcrumbs-schema");
      if (oldBreadcrumbs) oldBreadcrumbs.remove();
    }

    // Custom Schema (Product, Article, WebSite, etc.)
    if (schema) {
      injectJSONLD("seo-custom-schema", schema);
    } else {
      const oldSchema = document.getElementById("seo-custom-schema");
      if (oldSchema) oldSchema.remove();
    }

    return () => {
      const bCrumb = document.getElementById("seo-breadcrumbs-schema");
      if (bCrumb) bCrumb.remove();
      const cSchema = document.getElementById("seo-custom-schema");
      if (cSchema) cSchema.remove();
    };
  }, [finalTitle, finalDesc, keywords, fullCanonical, fullOgImage, ogType, noIndex, lang, breadcrumbs, schema]);

  return null;
}
