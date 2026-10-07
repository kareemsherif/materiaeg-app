import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function getOrSetStorage(storage: Storage, key: string, prefix: string): string {
  try {
    let val = storage.getItem(key);
    if (!val) {
      val = `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
      storage.setItem(key, val);
    }
    return val;
  } catch {
    return `${prefix}_fallback_${Date.now()}`;
  }
}

function detectDevice(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined" || !navigator.userAgent) return "desktop";
  const ua = navigator.userAgent;
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua)) {
    return "tablet";
  }
  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian)/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export default function PageTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Do NOT track admin panel pages
    if (location.pathname.startsWith("/admin")) {
      return;
    }

    // Avoid double counting same exact path on rapid re-renders
    if (lastTrackedPath.current === currentPath) {
      return;
    }
    lastTrackedPath.current = currentPath;

    // Small timeout to allow page title updates to settle
    const timer = setTimeout(() => {
      try {
        const sessionId = getOrSetStorage(sessionStorage, "materia_sid", "s");
        const visitorId = getOrSetStorage(localStorage, "materia_vid", "v");
        const deviceType = detectDevice();

        const payload = JSON.stringify({
          url: currentPath,
          title: document.title || "",
          referrer: document.referrer || "",
          session_id: sessionId,
          visitor_id: visitorId,
          device_type: deviceType,
        });

        // Use sendBeacon for non-blocking telemetry if available
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          const blob = new Blob([payload], { type: "application/json" });
          const sent = navigator.sendBeacon("/api/track_visit.php", blob);
          if (!sent) {
            // Fallback if beacon failed or queue full
            fetch("/api/track_visit.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload,
              keepalive: true,
            }).catch(() => {});
          }
        } else {
          fetch("/api/track_visit.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Silently catch any tracker errors so page performance is never impacted
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
}
