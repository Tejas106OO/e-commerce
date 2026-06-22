/**
 * Analytics utility — Google Analytics 4 + Sentry
 *
 * Google Analytics 4 (GA4):
 *   Set VITE_GA_ID in .env.local to your Measurement ID (G-XXXXXXXXXX)
 *   The gtag script is injected into index.html automatically.
 *
 * Sentry:
 *   Set VITE_SENTRY_DSN in .env.local.
 *   Install: npm install @sentry/react
 */

// ── GA4 Event Tracking ────────────────────────────────────────────────────────

/**
 * Track a GA4 event.
 * @param {string} eventName - e.g. 'add_to_cart', 'purchase'
 * @param {object} params    - Event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

/**
 * Track page views for SPA navigation.
 * Call this inside a useEffect whenever the route changes.
 * @param {string} path - Current page path
 * @param {string} title - Page title
 */
export function trackPageView(path, title) {
  if (typeof window.gtag !== 'function') return
  window.gtag('config', import.meta.env.VITE_GA_ID, {
    page_path:  path,
    page_title: title,
  })
}

// ── E-Commerce Events (GA4 Enhanced Ecommerce) ────────────────────────────────

export function trackViewItem(product) {
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price }]
  })
}

export function trackAddToCart(product, quantity = 1) {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: product.price * quantity,
    items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }]
  })
}

export function trackBeginCheckout(items, total) {
  trackEvent('begin_checkout', {
    currency: 'INR',
    value: total,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity }))
  })
}

export function trackPurchase(orderId, total, items) {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'INR',
    value: total,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity }))
  })
}

// ── Sentry Error Tracking ─────────────────────────────────────────────────────

/**
 * Initialize Sentry in main.jsx.
 *
 * Usage in main.jsx:
 *   import { initSentry } from './utils/analytics'
 *   initSentry()
 *
 * Requires: npm install @sentry/react
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn || import.meta.env.DEV) return

  // Lazy-load Sentry to avoid affecting initial bundle size
  import('@sentry/react').then(({ init, browserTracingIntegration, replayIntegration }) => {
    init({
      dsn,
      environment: import.meta.env.MODE,
      integrations: [
        browserTracingIntegration(),
        replayIntegration({ maskAllText: true, blockAllMedia: true })
      ],
      tracesSampleRate: 0.1,    // 10% of transactions
      replaysOnErrorSampleRate: 1.0,
    })
  }).catch(err => console.warn('Sentry failed to load:', err))
}

// ── GA4 Script Injector ───────────────────────────────────────────────────────

/**
 * Dynamically inject the GA4 script tag.
 * Call this once in main.jsx before ReactDOM.createRoot.
 *
 * In production, add to index.html directly for better performance:
 * <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
 */
export function initGA() {
  const id = import.meta.env.VITE_GA_ID
  if (!id) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function () { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false }) // manual SPA tracking
}
