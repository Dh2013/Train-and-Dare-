type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let analyticsReady = false;

export function initAnalytics(): void {
  if (!GA_MEASUREMENT_ID || analyticsReady || typeof window === 'undefined') {
    return;
  }

  analyticsReady = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
  });
}

export function trackPageView(path: string, title = document.title): void {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}

export function trackConversion(conversionName: string, params: AnalyticsParams = {}): void {
  trackEvent('generate_lead', {
    conversion_name: conversionName,
    event_category: 'conversion',
    ...params,
  });
}
