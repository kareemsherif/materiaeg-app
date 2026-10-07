import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Phone, Mail, Clock, Menu, X, ChevronDown, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useContent } from "@/context/ContentContext";
import type { Language } from "@/types";

export default function Header() {
  const { lang, setLang, t, isRTL } = useLanguage();
  const { settings } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const hotline = settings.hotline || "16870";
  const email = settings.email || "info@materiaeg.com";
  const hours = isRTL
    ? settings.workingHoursAr || t("contact.hours")
    : settings.workingHours || t("contact.hours");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(headerSearch.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
      setHeaderSearch("");
    }
  };

  const navItems = [
    { key: "nav.home", href: "/" },
    { key: "nav.products", href: "/products" },
    { key: "nav.industries", href: "/industries" },
    { key: "nav.about", href: "/about" },
    { key: "nav.contact", href: "/contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const toggleLang = () => setLang(lang === "ar" ? "en" : ("ar" as Language));

  return (
    <>
      {/* Top Bar */}
      <div className="bg-burgundy-900 text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
            <a href={`tel:${hotline}`} className="flex items-center gap-1.5 hover:text-cream-200 transition-colors">
              <Phone className="w-3 h-3" />
              <span>{hotline}</span>
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-cream-200 transition-colors">
              <Mail className="w-3 h-3" />
              <span>{email}</span>
            </a>
            <div className="flex items-center gap-1.5 text-cream-300">
              <Clock className="w-3 h-3" />
              <span>{hours}</span>
            </div>
          </div>
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 hover:text-cream-200 transition-colors font-semibold tracking-wider"
          >
            <span className="text-cream-300">{lang === "ar" ? "AR" : "EN"}</span>
            <span className="text-cream-500">|</span>
            <span>{t("nav.lang")}</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-200"
            : "bg-white border-b border-cream-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex items-center justify-between h-20 ${isRTL ? "flex-row-reverse" : ""}`}>
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src="/materia-logo.png" 
                alt="Materia - Premium Artificial Leather" 
                className="h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className={`hidden lg:flex items-center gap-8 ${isRTL ? "flex-row-reverse" : ""}`}>
              {navItems.map(({ key, href }) => (
                <Link
                  key={key}
                  to={href}
                  className={`nav-link text-sm font-medium transition-colors pb-0.5 ${
                    isActive(href)
                      ? "text-burgundy-900 border-b-2 border-burgundy-900"
                      : "text-charcoal-700 hover:text-burgundy-900"
                  }`}
                >
                  {t(key)}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className={`hidden lg:flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              {/* Expandable Desktop Search */}
              <div className="relative">
                {searchOpen ? (
                  <form onSubmit={handleHeaderSearchSubmit} className="flex items-center">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={headerSearch}
                      onChange={(e) => setHeaderSearch(e.target.value)}
                      placeholder={isRTL ? "ابحث عن خامة..." : "Search materials..."}
                      className={`w-52 py-1.5 ${isRTL ? "pr-8 pl-3 text-right" : "pl-8 pr-3 text-left"} text-xs rounded-full border border-burgundy-900/40 focus:outline-none focus:ring-1 focus:ring-burgundy-900 bg-cream-50 text-charcoal-800`}
                    />
                    <Search className={`w-3.5 h-3.5 text-charcoal-400 absolute ${isRTL ? "right-2.5" : "left-2.5"} pointer-events-none`} />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className={`p-1 text-charcoal-400 hover:text-charcoal-700 absolute ${isRTL ? "left-2" : "right-2"}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 rounded-full transition-colors"
                    title={isRTL ? "بحث عن خامات" : "Search materials"}
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={toggleLang}
                className="text-xs font-semibold text-charcoal-500 hover:text-burgundy-900 transition-colors px-2 py-1 border border-cream-300 rounded"
              >
                {t("nav.lang")}
              </button>
              <Link to="/contact" className="btn-primary text-xs py-2 px-5">
                {t("nav.quote")}
              </Link>
            </div>

            {/* Mobile Actions: Search & Menu Toggle */}
            <div className={`lg:hidden flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-charcoal-700 hover:text-burgundy-900 transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-cream-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-3">
              {/* Mobile Search Bar */}
              <form onSubmit={handleHeaderSearchSubmit} className="relative">
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder={isRTL ? "ابحث عن خامة، كود، أو استخدام..." : "Search material, code, or application..."}
                  className={`w-full py-2.5 ${isRTL ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left"} text-sm rounded-lg border border-cream-300 focus:outline-none focus:border-burgundy-900 bg-cream-50 text-charcoal-800`}
                />
                <Search className={`w-4 h-4 text-charcoal-400 absolute top-3 ${isRTL ? "right-3" : "left-3"}`} />
              </form>

              <div className="space-y-1">
                {navItems.map(({ key, href }) => (
                  <Link
                    key={key}
                    to={href}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(href)
                        ? "bg-burgundy-50 text-burgundy-900"
                        : "text-charcoal-700 hover:bg-cream-100 hover:text-burgundy-900"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t(key)}
                  </Link>
                ))}
              </div>

              <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                <button
                  onClick={toggleLang}
                  className="text-sm font-semibold text-charcoal-600 hover:text-burgundy-900 transition-colors"
                >
                  {t("nav.lang")}
                </button>
                <Link to="/contact" className="btn-primary text-xs py-2 px-4">
                  {t("nav.quote")}
                </Link>
              </div>

              {/* Mobile Legal Links */}
              <div className={`pt-2 border-t border-cream-200 flex items-center justify-center gap-3 text-xs text-charcoal-500 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Link to="/privacy" className="hover:text-burgundy-900 transition-colors">
                  {t("footer.privacy")}
                </Link>
                <span>·</span>
                <Link to="/terms" className="hover:text-burgundy-900 transition-colors">
                  {t("footer.terms")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
