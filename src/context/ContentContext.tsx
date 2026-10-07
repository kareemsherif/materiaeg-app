import React, { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS as baseProducts, INDUSTRIES as initialIndustries, APPLICATIONS as initialApplications } from "@/constants/data";
import { translations as initialTranslations } from "@/lib/translations";
import type { Product, Industry, ProductApplication } from "@/types";

interface ContentContextType {
  products: Product[];
  industries: Industry[];
  applications: ProductApplication[];
  translations: typeof initialTranslations;
  settings: Record<string, string>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addProduct: (product: Product) => Promise<boolean>;
  updateIndustry: (industry: Industry) => Promise<boolean>;
  addIndustry: (industry: Industry) => Promise<boolean>;
  deleteIndustry: (id: string) => Promise<boolean>;
  updateTranslations: (newTranslations: typeof initialTranslations) => Promise<boolean>;
  updateSettings: (newSettings: Record<string, string>) => Promise<boolean>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const normalizeSlug = (s: string): string => {
  let out = (s || "").toLowerCase().trim();
  while (out.startsWith("favini-")) out = out.slice("favini-".length);
  return out;
};

const scrubFavini = (text?: string): string => {
  if (!text) return "";
  return text
    .replace(/من (تشكيلة|مجموعة)\s*favini\s*العالمية\s*/gi, "")
    .replace(/favini\s*release\s*paper\s*texture\s*/gi, "Release paper texture ")
    .replace(/\bfavini\b\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

// Strips legacy "favini-" prefixes and removes any "Favini" mentions from text
const normalizeProduct = (p: Product): Product => {
  const cleanSlug =
    p.slug && typeof p.slug === "string" && p.slug.toLowerCase().startsWith("favini-")
      ? normalizeSlug(p.slug)
      : p.slug;

  const descEn = scrubFavini(p.description?.en);
  const descAr = scrubFavini(p.description?.ar);
  const nameEn = scrubFavini(p.name?.en);
  const nameAr = scrubFavini(p.name?.ar);

  return {
    ...p,
    slug: cleanSlug,
    name: {
      en: nameEn || p.name?.en || "",
      ar: nameAr || p.name?.ar || "",
    },
    description: {
      en: descEn || p.description?.en || "",
      ar: descAr || p.description?.ar || "",
    },
  };
};

const sortProductsByPriority = (items: Product[]): Product[] => {
  const bestSellerAndNew: Product[] = [];
  const bestSellers: Product[] = [];
  const newProducts: Product[] = [];
  const others: Product[] = [];

  items.forEach((p) => {
    if (p.isBestSeller && p.isNew) {
      bestSellerAndNew.push(p);
    } else if (p.isBestSeller) {
      bestSellers.push(p);
    } else if (p.isNew) {
      newProducts.push(p);
    } else {
      others.push(p);
    }
  });

  return [...bestSellerAndNew, ...bestSellers, ...newProducts, ...others];
};

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(sortProductsByPriority(baseProducts));
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries);
  const [applications] = useState<ProductApplication[]>(initialApplications);
  const [translations, setTranslations] = useState(initialTranslations);
  const [settings, setSettings] = useState<Record<string, string>>({
    whatsapp: "201290053380",
    email: "info@materiaeg.com",
    hotline: "16870",
    website: "www.materiaeg.com",
    address: "422 El-Gaish Rd, Porto Louran Building, Alexandria",
    address2: "Western Extension, Piece 12, 8th Industrial Zone, Sadat City, El Monofeya",
    workingHours: "Mon – Sat: 8:00 AM – 5:00 PM",
    workingHoursAr: "الاثنين – السبت: ٨:٠٠ ص – ٥:٠٠ م",
    map_embed: "https://maps.google.com/maps?q=31.2497928,29.9696202&z=17&output=embed"
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE = "/api";
  const getAuthHeader = () => {
    const token = localStorage.getItem("admin_token");
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  useEffect(() => {
    // Safety timeout: if API takes too long, fall back to local data
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/get_data.php`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("JSON Parse Error. Response was:", text);
          // Don't throw, just use defaults
          setIsLoading(false);
          return;
        }

        if (data && typeof data === "object") {
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setProducts(sortProductsByPriority((data.products as Product[]).map(normalizeProduct)));
          } else {
            // API returned no products (e.g. empty DB in dev): lazy-load the
            // large Favini catalogue as a separate chunk so it never inflates
            // the initial bundle.
            try {
              const { FAVINI_PRODUCTS } = await import("@/constants/faviniData");
              setProducts(sortProductsByPriority([...baseProducts, ...FAVINI_PRODUCTS]));
            } catch (e) {
              console.error("Failed to lazy-load fallback catalogue:", e);
            }
          }
          if (data.industries && Array.isArray(data.industries) && data.industries.length > 0) {
            setIndustries(data.industries);
          }
          if (data.translations && data.translations.en && Object.keys(data.translations.en).length > 0) {
            setTranslations(data.translations);
          }
          if (data.settings) {
            setSettings(prev => ({ ...prev, ...data.settings }));
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Fetch error:", err);
        setError(msg);
        // Offline / API down in dev: lazy-load the fallback catalogue
        try {
          const { FAVINI_PRODUCTS } = await import("@/constants/faviniData");
          setProducts(sortProductsByPriority([...baseProducts, ...FAVINI_PRODUCTS]));
        } catch (e) {
          console.error("Failed to lazy-load fallback catalogue:", e);
        }
      } finally {
        setIsLoading(false);
        clearTimeout(timeout);
      }
    };
    fetchData();
    return () => clearTimeout(timeout);
  }, []);

  const postJSON = async (url: string, body: unknown): Promise<boolean> => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        console.error(`Request to ${url} failed with status ${res.status}`);
        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login?expired=1";
          }
        }
        return false;
      }
      const data = await res.json().catch(() => null);
      if (data && data.error) {
        console.error(`Request to ${url} returned error:`, data.error);
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Failed to persist to ${url}:`, error);
      return false;
    }
  };

  const updateProduct = async (product: Product): Promise<boolean> => {
    const clean = normalizeProduct(product);
    const ok = await postJSON(`${API_BASE}/save_product.php`, clean);
    if (ok) {
      setProducts(prev => sortProductsByPriority(prev.map(p => p.id === clean.id ? clean : p)));
    }
    return ok;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const ok = await postJSON(`${API_BASE}/delete_product.php`, { id });
    if (ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
    return ok;
  };

  const addProduct = async (product: Product): Promise<boolean> => {
    const clean = normalizeProduct(product);
    const ok = await postJSON(`${API_BASE}/save_product.php`, clean);
    if (ok) {
      setProducts(prev => sortProductsByPriority([...prev, clean]));
    }
    return ok;
  };

  const updateIndustry = async (industry: Industry): Promise<boolean> => {
    const ok = await postJSON(`${API_BASE}/save_industry.php`, industry);
    if (ok) {
      setIndustries(prev => prev.map(i => i.id === industry.id ? industry : i));
    }
    return ok;
  };

  const addIndustry = async (industry: Industry): Promise<boolean> => {
    const ok = await postJSON(`${API_BASE}/save_industry.php`, industry);
    if (ok) {
      setIndustries(prev => [...prev, industry]);
    }
    return ok;
  };

  const deleteIndustry = async (id: string): Promise<boolean> => {
    const ok = await postJSON(`${API_BASE}/delete_industry.php`, { id });
    if (ok) {
      setIndustries(prev => prev.filter(i => i.id !== id));
    }
    return ok;
  };

  const updateTranslations = async (newTranslations: typeof initialTranslations): Promise<boolean> => {
    const ok = await postJSON(`${API_BASE}/save_translations.php`, newTranslations);
    if (ok) {
      setTranslations(newTranslations);
    }
    return ok;
  };

  const updateSettings = async (newSettings: Record<string, string>): Promise<boolean> => {
    const ok = await postJSON(`${API_BASE}/save_settings.php`, newSettings);
    if (ok) {
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
    return ok;
  };

  if (error && !products.length) {
    console.log("Rendering with error:", error);
  }

  return (
    <ContentContext.Provider
      value={{
        products,
        industries,
        applications,
        translations,
        settings,
        updateProduct,
        deleteProduct,
        addProduct,
        updateIndustry,
        addIndustry,
        deleteIndustry,
        updateTranslations,
        updateSettings
      }}
    >
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-burgundy-900/20 border-t-burgundy-900 rounded-full animate-spin" />
            <p className="text-charcoal-400 text-sm font-medium animate-pulse">Loading Materia...</p>
          </div>
        </div>
      ) : children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
