// src/GoogleTag.tsx
import { useEffect } from "react";

/**
 * Simple Google Tag injector.
 * - Uses Vite env: import.meta.env.VITE_GTAG_ID
 * - Loads only in production (import.meta.env.PROD).
 * - Cleans up on unmount.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export default function GoogleTag() {
  const id = import.meta.env.VITE_GTAG_ID || "AW-17504856600"; // fallback id if you prefer
  useEffect(() => {
    if (!id) return;
    // only load in production (recommended). Remove the check to test in dev.
    if (!import.meta.env.PROD) return;

    // load remote gtag.js
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);

    // inject initialization snippet
    const inline = document.createElement("script");
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${id}');
    `;
    document.head.appendChild(inline);

    return () => {
      // cleanup (usually not necessary for SPA but safe)
      if (s.parentNode) s.parentNode.removeChild(s);
      if (inline.parentNode) inline.parentNode.removeChild(inline);
    };
  }, [id]);

  return null;
}
