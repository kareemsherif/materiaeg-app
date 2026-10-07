import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import IndustriesPage from "@/pages/IndustriesPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";
import NotFound from "@/pages/NotFound";
import WhatsAppFloat from "@/components/features/WhatsAppFloat";
import CookieConsentBanner from "@/components/features/CookieConsentBanner";
import { AdminProvider } from "@/context/AdminContext";
import { ContentProvider } from "@/context/ContentContext";
import AdminLayout from "@/components/layout/AdminLayout";
import LoginPage from "@/pages/admin/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import ManageProducts from "@/pages/admin/ManageProducts";
import ManageIndustries from "@/pages/admin/ManageIndustries";
import SiteSettings from "@/pages/admin/SiteSettings";
import ManageTranslations from "@/pages/admin/ManageTranslations";
import MessagesPage from "@/pages/admin/MessagesPage";
import PushNotificationsPage from "@/pages/admin/PushNotificationsPage";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PageTracker from "@/components/analytics/PageTracker";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <ContentProvider>
      <LanguageProvider>
        <AdminProvider>
          <BrowserRouter>
            <PageTracker />
            <ScrollToTop />
            <Toaster position="top-center" richColors />
            <div className="min-h-screen flex flex-col">
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/*"
                  element={
                    <>
                      <Header />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/products/:slug" element={<ProductDetailPage />} />
                          <Route path="/industries" element={<IndustriesPage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route path="/privacy" element={<PrivacyPolicyPage />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                          <Route path="/terms" element={<TermsPage />} />
                          <Route path="/terms-of-service" element={<TermsPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                      <WhatsAppFloat />
                      <CookieConsentBanner />
                    </>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="products" element={<ManageProducts />} />
                  <Route path="industries" element={<ManageIndustries />} />
                  <Route path="translations" element={<ManageTranslations />} />
                  <Route path="settings" element={<SiteSettings />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="notifications" element={<PushNotificationsPage />} />
                </Route>
              </Routes>
            </div>
          </BrowserRouter>
        </AdminProvider>
      </LanguageProvider>
    </ContentProvider>
  );
}
