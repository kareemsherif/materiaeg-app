import { useState, useEffect, useCallback } from "react";
import { 
  Package, 
  Building2, 
  Users, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Tablet, 
  FileText, 
  Activity, 
  ExternalLink,
  ShieldCheck,
  Radio
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { useContent } from "@/context/ContentContext";
import { useLanguage } from "@/context/LanguageContext";

interface AnalyticsData {
  total_visits: number;
  unique_visitors: number;
  total_pageviews: number;
  today_visits: number;
  today_pageviews: number;
  yesterday_visits: number;
  this_month_visits: number;
  quote_requests: number;
  total_messages: number;
  growth_percent: number;
  visits_last_7_days: number;
  daily_chart: Array<{
    date: string;
    label: string;
    labelAr: string;
    visits: number;
    pageviews: number;
  }>;
  devices: {
    desktop: { count: number; percentage: number };
    mobile: { count: number; percentage: number };
    tablet: { count: number; percentage: number };
  };
  top_pages: Array<{
    url: string;
    title: string;
    views: number;
    unique_visits: number;
  }>;
  recent_visits: Array<{
    url: string;
    title: string;
    device_type: string;
    referrer: string;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const { products, industries } = useContent();
  const { isRTL } = useLanguage();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/get_analytics.php", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setAnalytics(data);
          setLastUpdated(new Date());
        }
      } else if (res.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login?expired=1";
      }
    } catch (err) {
      console.error("Failed to load real analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const getSafeUrl = (url: string): string => {
    if (!url) return "#";
    const trimmed = url.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return "#";
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Format relative time helper for recent activity
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr.replace(" ", "T"));
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return isRTL ? "الآن" : "Just now";
      if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
      if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
      return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case "tablet":
        return <Tablet className="w-4 h-4 text-blue-600" />;
      default:
        return <Monitor className="w-4 h-4 text-purple-600" />;
    }
  };

  const formatDeviceName = (type: string) => {
    switch (type?.toLowerCase()) {
      case "mobile":
        return isRTL ? "موبايل" : "Mobile";
      case "tablet":
        return isRTL ? "تابلت" : "Tablet";
      default:
        return isRTL ? "كمبيوتر" : "Desktop";
    }
  };

  const totalVisitsVal = analytics ? analytics.total_visits : 0;
  const uniqueVisitorsVal = analytics ? analytics.unique_visitors : 0;
  const quoteRequestsVal = analytics ? analytics.quote_requests : 0;
  const growthPercent = analytics ? analytics.growth_percent : 0;
  const isPositiveGrowth = growthPercent >= 0;

  const statsCards = [
    {
      label: isRTL ? "إجمالي الزيارات الحقيقية" : "Genuine Site Visits",
      value: loading ? "..." : totalVisitsVal.toLocaleString(),
      subtext: analytics 
        ? (isRTL 
            ? `+${analytics.today_visits} اليوم • ${analytics.total_pageviews} مشاهدة` 
            : `+${analytics.today_visits} today • ${analytics.total_pageviews} views`)
        : (isRTL ? "جاري التحميل..." : "Loading..."),
      icon: Eye,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      label: isRTL ? "الزوار الفريدين" : "Unique Visitors",
      value: loading ? "..." : uniqueVisitorsVal.toLocaleString(),
      subtext: analytics 
        ? (isRTL 
            ? `+${analytics.this_month_visits} جلسة هذا الشهر` 
            : `${analytics.this_month_visits} visits this month`)
        : (isRTL ? "جاري التحميل..." : "Loading..."),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      label: isRTL ? "طلبات التسعير" : "Quote Requests",
      value: loading ? "..." : quoteRequestsVal.toLocaleString(),
      subtext: analytics 
        ? (isRTL 
            ? `من أصل ${analytics.total_messages} رسالة واردة` 
            : `From ${analytics.total_messages} messages`)
        : (isRTL ? "جاري التحميل..." : "Loading..."),
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
      badgeColor: "bg-amber-100 text-amber-800",
      href: "/admin/messages?type=quote",
    },
    {
      label: isRTL ? "إجمالي المنتجات" : "Total Products",
      value: products.length.toLocaleString(),
      subtext: isRTL ? `${industries.length} قطاعات معروضة` : `${industries.length} industries listed`,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      badgeColor: "bg-purple-100 text-purple-800",
      href: "/admin/products",
    },
  ];

  return (
    <div className={`space-y-8 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 
              className="text-3xl font-bold text-charcoal-900" 
              style={{ fontFamily: isRTL ? "Tajawal, sans-serif" : "Playfair Display, serif" }}
            >
              {isRTL ? "لوحة التحكم" : "Admin Dashboard"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isRTL ? "التحليلات الحية" : "Live Tracking"}
            </span>
          </div>
          <p className="text-charcoal-500 text-sm mt-1">
            {isRTL 
              ? "متابعة وإحصائيات الزيارات الحقيقية للموقع وطلبات التسعير والكتالوج." 
              : "Real-time analytics for website visitors, quote requests, and product catalog."}
          </p>
        </div>

        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          {lastUpdated && (
            <span className="text-xs text-charcoal-400 hidden md:inline">
              {isRTL ? "آخر تحديث:" : "Updated:"} {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-200 rounded-xl text-sm font-semibold text-charcoal-700 hover:text-burgundy-900 hover:border-burgundy-900/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title={isRTL ? "تحديث البيانات الحالية" : "Refresh Analytics"}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-burgundy-900" : ""}`} />
            <span>{isRTL ? "تحديث الإحصائيات" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => {
          const CardContent = (
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.href && (
                  <ExternalLink className="w-4 h-4 text-charcoal-300 group-hover:text-burgundy-900 transition-colors" />
                )}
              </div>
              <p className="text-sm font-medium text-charcoal-500">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-charcoal-900 mt-1 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs text-charcoal-400 mt-2 font-medium">
                {stat.subtext}
              </p>
            </div>
          );

          return stat.href ? (
            <Link key={i} to={stat.href} className="block">
              {CardContent}
            </Link>
          ) : (
            <div key={i}>{CardContent}</div>
          );
        })}
      </div>

      {/* Real Traffic Chart Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-cream-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-burgundy-900" />
              {isRTL ? "نشاط الزيارات الحقيقي للموقع (آخر 14 يوم)" : "Genuine Website Visits (Last 14 Days)"}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              {isRTL 
                ? "يتم تسجيل الزيارات الفعلية وتحديثها تلقائياً بدون تكرار أو روبوتات وهمية" 
                : "Real visits recorded automatically with bot & duplicate debounce filtering."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              isPositiveGrowth 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {isPositiveGrowth ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {isPositiveGrowth ? `+${growthPercent}%` : `${growthPercent}%`}{" "}
                {isRTL ? "هذا الأسبوع" : "this week"}
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full pt-2">
          {analytics && analytics.daily_chart && analytics.daily_chart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.daily_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800020" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#800020" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                <XAxis 
                  dataKey={isRTL ? "labelAr" : "label"} 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false} 
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const visits = payload.find(p => p.dataKey === "visits")?.value ?? 0;
                      const views = payload.find(p => p.dataKey === "pageviews")?.value ?? 0;
                      return (
                        <div className="bg-charcoal-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-charcoal-800">
                          <p className="font-bold text-cream-200 border-b border-charcoal-700 pb-1">{label}</p>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-burgundy-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-burgundy-400" />
                              {isRTL ? "الزيارات الفريدة:" : "Visits:"}
                            </span>
                            <span className="font-bold">{visits}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-emerald-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              {isRTL ? "مشاهدات الصفحات:" : "Page Views:"}
                            </span>
                            <span className="font-bold">{views}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pageviews" 
                  stroke="#059669" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  name={isRTL ? "مشاهدات الصفحات" : "Page Views"}
                />
                <Area 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#800020" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorVisits)" 
                  name={isRTL ? "الزيارات" : "Visits"}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-charcoal-400 text-sm">
              <Eye className="w-8 h-8 mb-2 opacity-40" />
              <p>{isRTL ? "جاري تجميع إحصائيات الزيارات..." : "Collecting visitor statistics..."}</p>
            </div>
          )}
        </div>

        {/* Legend / Summary Strip */}
        <div className="mt-6 pt-4 border-t border-cream-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-burgundy-900" />
              <span className="text-charcoal-600 font-medium">
                {isRTL ? "الزيارات / الجلسات الفعلية" : "Visits / Sessions"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-charcoal-600 font-medium">
                {isRTL ? "إجمالي تصفح الصفحات" : "Page Views"}
              </span>
            </div>
          </div>
          <div className="text-charcoal-500 font-medium">
            {isRTL 
              ? `إجمالي زيارات آخر 7 أيام: ${analytics?.visits_last_7_days ?? 0}` 
              : `Last 7 days total visits: ${analytics?.visits_last_7_days ?? 0}`}
          </div>
        </div>
      </div>

      {/* Grid: Devices Breakdown + Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-charcoal-900 mb-1 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-burgundy-900" />
              {isRTL ? "توزيع أجهزة الزوار" : "Visitor Devices Breakdown"}
            </h3>
            <p className="text-xs text-charcoal-500 mb-6">
              {isRTL ? "نسبة الزوار حسب نوع الجهاز (موبايل، كمبيوتر، تابلت)" : "Percentage of visits by device type."}
            </p>

            <div className="space-y-5">
              {[
                { 
                  type: "mobile", 
                  label: isRTL ? "الهواتف الذكية" : "Mobile Phones", 
                  icon: Smartphone, 
                  data: analytics?.devices.mobile, 
                  color: "bg-emerald-600" 
                },
                { 
                  type: "desktop", 
                  label: isRTL ? "أجهزة الكمبيوتر" : "Desktop Computers", 
                  icon: Monitor, 
                  data: analytics?.devices.desktop, 
                  color: "bg-burgundy-900" 
                },
                { 
                  type: "tablet", 
                  label: isRTL ? "الأجهزة اللوحية (تابلت)" : "Tablets", 
                  icon: Tablet, 
                  data: analytics?.devices.tablet, 
                  color: "bg-blue-600" 
                },
              ].map((item, idx) => {
                const count = item.data?.count ?? 0;
                const percentage = item.data?.percentage ?? 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-charcoal-700 flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-charcoal-500" />
                        {item.label}
                      </span>
                      <span className="text-xs font-bold text-charcoal-900">
                        {percentage}% ({count})
                      </span>
                    </div>
                    <div className="w-full bg-cream-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`} 
                        style={{ width: `${Math.max(percentage, count > 0 ? 3 : 0)}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cream-100 text-xs text-charcoal-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isRTL 
                ? "يتم التعرف على الأجهزة بأمان مع تشفير تام لبيانات الزوار." 
                : "Devices detected securely while preserving visitor privacy."}
            </span>
          </div>
        </div>

        {/* Top Visited Pages */}
        <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm">
          <h3 className="font-bold text-lg text-charcoal-900 mb-1 flex items-center gap-2">
            <Eye className="w-5 h-5 text-burgundy-900" />
            {isRTL ? "أكثر الصفحات زيارة" : "Top Visited Pages"}
          </h3>
          <p className="text-xs text-charcoal-500 mb-6">
            {isRTL ? "الصفحات الأكثر مشاهدة من قبل الزوار الحقيقيين" : "Pages generating the highest real traffic."}
          </p>

          <div className="space-y-3.5">
            {analytics?.top_pages && analytics.top_pages.length > 0 ? (
              analytics.top_pages.map((page, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors border border-cream-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-charcoal-900 truncate">
                      {page.title || page.url}
                    </p>
                    <p className="text-xs text-charcoal-500 font-mono truncate" dir="ltr">
                      {page.url}
                    </p>
                  </div>
                  <div className={`flex items-center gap-3 shrink-0 ${isRTL ? "mr-4" : "ml-4"}`}>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-burgundy-900 border border-cream-200 shadow-xs">
                      {page.views} {isRTL ? "مشاهدة" : "views"}
                    </span>
                    <a 
                      href={getSafeUrl(page.url)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-1 text-charcoal-400 hover:text-burgundy-900 transition-colors"
                      title={isRTL ? "فتح الصفحة" : "Visit page"}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-charcoal-400 text-sm">
                <p>{isRTL ? "لا توجد زيارات مسجلة بعد." : "No visits recorded yet."}</p>
                <p className="text-xs mt-1 text-charcoal-500">
                  {isRTL ? "ستظهر الإحصائيات هنا فور تصفح الزوار للموقع." : "Stats will populate as visitors browse the site."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Visits / Real Activity Log */}
      <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
        <div className={`p-6 border-b border-cream-100 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <h3 className={`font-bold text-charcoal-900 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Clock className="w-5 h-5 text-burgundy-900" />
            <span>{isRTL ? "سجل الزيارات والنشاطات الحديثة" : "Recent Visitor Activity Log"}</span>
          </h3>
          <span className="text-xs font-semibold text-charcoal-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            {isRTL ? "مباشر" : "Real-time"}
          </span>
        </div>

        <div className="p-6">
          {analytics?.recent_visits && analytics.recent_visits.length > 0 ? (
            <div className="divide-y divide-cream-100">
              {analytics.recent_visits.map((activity, i) => (
                <div key={i} className={`py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className={`flex items-center gap-3.5 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>
                    <div className="w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center shrink-0">
                      {getDeviceIcon(activity.device_type)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-charcoal-900">
                        {activity.title || activity.url}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-0.5">
                        <span className="font-medium text-charcoal-700">
                          {formatDeviceName(activity.device_type)}
                        </span>
                        <span>&bull;</span>
                        <span className="font-mono" dir="ltr">{activity.url}</span>
                        {activity.referrer && (
                          <>
                            <span>&bull;</span>
                            <span className="text-charcoal-400 truncate max-w-[140px]" title={activity.referrer}>
                              {isRTL ? "من:" : "from:"} {activity.referrer.replace(/^https?:\/\//, "")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-charcoal-400 shrink-0">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-charcoal-400 text-sm">
              <p>{isRTL ? "لا توجد زيارات مسجلة بعد في السجل." : "No visits in the activity log yet."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
