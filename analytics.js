(() => {
  'use strict';
  const measurementId = 'G-T3DL7CQM8X';
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
  if (!/^https?:$/.test(location.protocol) || /^(localhost|127\..*|\[?::1\]?)$/.test(location.hostname)) return;
  if (window.billiardAnalyticsLoaded) return;
  window.billiardAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(script);
})();
