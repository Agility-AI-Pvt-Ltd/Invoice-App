// src/GoogleTag.tsx
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Google Tag injector:
 * - Reads VITE_GTAG_ID (GA4) and VITE_AW_ID (Google Ads) from env
 * - Loads gtag.js once (using the first available id)
 * - Calls gtag('config', id) for every configured id
 * - Only runs in production (import.meta.env.PROD)
 */

export default function GoogleTag() {
  const gaId = import.meta.env.VITE_GTAG_ID || ""; // e.g. G-XXXXX
  const awId = import.meta.env.VITE_AW_ID || "";   // e.g. AW-XXXXX

  useEffect(() => {
    // only load in production builds (recommended).
    if (!import.meta.env.PROD) return;

    // do nothing if no ids configured
    if (!gaId && !awId) return;

    // choose one id to add script tag (prefer GA4 then AW)
    const scriptId = gaId || awId;

    // create remote script
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${scriptId}`;
    document.head.appendChild(s);

    // inline init
    const inline = document.createElement("script");
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
    `;
    document.head.appendChild(inline);

    // call config for each id (slight delay to ensure gtag defined)
    const t = setTimeout(() => {
      try {
        if (gaId && window.gtag) window.gtag('config', gaId);
        if (awId && window.gtag) window.gtag('config', awId);
      } catch (e) {
        // silent
      }
    }, 50);

    return () => {
      if (s.parentNode) s.parentNode.removeChild(s);
      if (inline.parentNode) inline.parentNode.removeChild(inline);
      clearTimeout(t);
    };
  }, [gaId, awId]);

  return null;
}
