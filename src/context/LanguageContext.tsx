import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language, LanguageContextType } from "@/types";
import { useContent } from "./ContentContext";

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: () => "",
  isRTL: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { translations } = useContent();
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("materia-lang") as Language) || "ar";
  });

  const isRTL = lang === "ar";

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("materia-lang", newLang);
  };

  const t = (key: string): string => {
    const dict = (translations[lang] || {}) as Record<string, string>;
    const enDict = (translations.en || {}) as Record<string, string>;
    return dict[key] || enDict[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.body.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
