export interface Translation {
  en: string;
  ar: string;
}

export interface ProductColor {
  name: Translation;
  hex: string;
}

export interface ProductApplication {
  id: string;
  name: Translation;
  benefit: Translation;
  image: string;
  icon: string;
}

export interface Product {
  id: string;
  slug: string;
  name: Translation;
  code: string;
  description: Translation;
  thickness: string;
  width: string;
  materialType: Translation;
  texture: Translation;
  backing: Translation;
  finish: Translation;
  waterResistance: Translation;
  fireResistance: Translation;
  softnessLevel: Translation;
  isNew?: boolean;
  isBestSeller?: boolean;
  image: string;
  galleryImages: string[];
  colors: ProductColor[];
  applications: string[];
  categories: string[];
}

export interface Industry {
  id: string;
  name: Translation;
  description: Translation;
  icon: string;
  image: string;
  products: string[];
  applications: string[];
}

export interface Inquiry {
  name: string;
  email: string;
  phone: string;
  company?: string;
  productId?: string;
  message: string;
  type: "sample" | "quote" | "general";
}

export type Language = "en" | "ar";

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

export interface NavItem {
  label: Translation;
  href: string;
}
