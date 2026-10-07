import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
  LayoutDashboard, 
  Package, 
  Building2, 
  Settings, 
  LogOut, 
  Menu,
  ChevronRight,
  ChevronLeft,
  Languages,
  Inbox,
  Bell
} from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAdmin();
  const { isRTL } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: isRTL ? "لوحة التحكم" : "Dashboard",    href: "/admin",              icon: LayoutDashboard },
    { name: isRTL ? "الخامات والمنتجات" : "Products",     href: "/admin/products",     icon: Package },
    { name: isRTL ? "مجالات الاستخدام" : "Industries",   href: "/admin/industries",   icon: Building2 },
    { name: isRTL ? "رسائل العملاء" : "Messages",     href: "/admin/messages",     icon: Inbox },
    { name: isRTL ? "إشعارات الموبايل" : "Notifications", href: "/admin/notifications", icon: Bell },
    { name: isRTL ? "الترجمات والنصوص" : "Translations", href: "/admin/translations", icon: Languages },
    { name: isRTL ? "إعدادات الموقع" : "Settings",     href: "/admin/settings",     icon: Settings },
  ];

  return (
    <div className={`min-h-screen bg-cream-50 flex ${isRTL ? "flex-row-reverse" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-charcoal-900 text-white transition-all duration-300 flex flex-col fixed h-full z-30 ${
          isRTL ? "right-0" : "left-0"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/admin" className="flex items-center">
              <img 
                src="/materia-logo.png" 
                alt="Materia Admin" 
                className="h-10 w-auto brightness-0 invert opacity-90"
              />
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-charcoal-800 rounded transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-burgundy-900 text-white shadow-lg shadow-burgundy-900/20" 
                    : "text-charcoal-400 hover:text-white hover:bg-charcoal-800"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                {isSidebarOpen && isActive && (
                  isRTL ? <ChevronLeft className="w-4 h-4 mr-auto opacity-50" /> : <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-charcoal-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-charcoal-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${
        isSidebarOpen 
          ? (isRTL ? "mr-64" : "ml-64") 
          : (isRTL ? "mr-20" : "ml-20")
      } p-8`}>
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
