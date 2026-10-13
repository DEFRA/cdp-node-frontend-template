// Client-side cookie consent management.
//
// This module progressively enhances the cookie banner. When JavaScript
// is available, it intercepts the banner's form buttons and handles
// consent asynchronously — providing a smoother user experience.
//
// KEY BEHAVIOURS:
//
// 1. IMMEDIATE GTM LOADING ON ACCEPT:
//    When the user clicks "Accept analytics cookies", loadGoogleAnalytics()
//    dynamically creates a <script> element pointing to GTM. This means
//    analytics start tracking immediately — the user doesn't need to wait
//    for a page reload. The GTM container ID is read from a data attribute
//    on the banner element (set server-side from config).
//
// 2. GA COOKIE DELETION ON REJECT:
//    When the user clicks "Reject analytics cookies", ALL Google Analytics
//    cookies are deleted immediately. GA cookies can be set on multiple
//    domain variants (e.g. .example.com, .service.example.com), so we
//    build a list of all possible domains and delete on each one.
//    The cookie prefixes we look for: _ga, _gid, _gat, _dc_gtm_
//
// 3. ASYNC SUBMISSION WITH CSRF:
//    The consent choice is sent to the server via XHR POST with the
//    CSRF token (crumb) in the JSON body. The server persists the
//    choice in the consent cookie. If XHR fails, the form's native
//    submission is the fallback.
//
// 4. STALE COOKIE CLEANUP:
//    cleanupStaleCookies() handles an edge case: if a user accepted
//    analytics, GA cookies were set, but then the consent cookie expired
//    or was cleared. On the next page load, the banner would reappear
//    (confirmed: false) but GA cookies would still exist. If the banner
//    is showing and no GTM script is loaded, we proactively delete any
//    leftover GA cookies.

// All known Google Analytics cookie prefixes
const GA_COOKIE_PREFIXES = ['_ga', '_gid', '_gat', '_dc_gtm_']

// Build a list of all domain variants where GA might have set cookies.
// For hostname "service.example.gov.uk", this produces:
//   service.example.gov.uk
//   .service.example.gov.uk
//   .example.gov.uk
//   .gov.uk
function buildDeletableDomains(hostname) {
  const domains = new Set()

  domains.add(hostname)
  domains.add('.' + hostname)

  const parts = hostname.split('.')

  for (let i = 1; i < parts.length - 1; i++) {
    domains.add('.' + parts.slice(i).join('.'))
  }

  return domains
}

// Delete ALL Google Analytics cookies across all possible domain variants.
// We iterate every cookie in the browser, check if it matches a GA prefix,
// and if so, expire it on every domain variant.
function deleteGoogleAnalyticsCookies() {
  const allCookies = document.cookie.split(';')
  const hostname = globalThis.location.hostname
  const domains = buildDeletableDomains(hostname)

  for (const cookie of allCookies) {
    const cookieName = cookie.split('=')[0].trim()
    const isGaCookie = GA_COOKIE_PREFIXES.some((prefix) =>
      cookieName.startsWith(prefix)
    )

    if (isGaCookie) {
      // Delete without domain (covers exact hostname match)
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`

      // Delete on every domain variant (covers parent domains)
      for (const domain of domains) {
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`
      }
    }
  }
}

// Dynamically load Google Tag Manager by creating a script element.
// This is called immediately when the user clicks "Accept" — no page
// reload needed. GTM then loads GA which starts setting cookies.
//
// The GTM key is validated against a strict pattern to prevent
// script injection via a tampered data attribute.
function loadGoogleAnalytics(gtmKey) {
  if (!gtmKey || !/^GTM-[A-Z0-9]+$/.test(gtmKey)) {
    return
  }

  globalThis.dataLayer = globalThis.dataLayer || []
  globalThis.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmKey}`

  document.head.appendChild(script)
}

export default {
  init() {
    this.setupCookieComponentListeners()
    this.cleanupStaleCookies()
    this.setupBfcacheGuard()
  },

  // Guard against the back/forward cache (bfcache) restoring a stale page
  // that was rendered while analytics were accepted. When a bfcache restore
  // is detected via event.persisted, we immediately delete any GA cookies
  // and reload so the server renders the correct consent state.
  //
  // This is a defence-in-depth measure. The primary protection is the
  // server-side Cache-Control: no-store header, which makes pages ineligible
  // for bfcache. This handler catches any browser that restores the page
  // despite that header.
  setupBfcacheGuard() {
    globalThis.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        deleteGoogleAnalyticsCookies()
        globalThis.location.reload()
      }
    })
  },

  // Handle edge case: GA cookies exist but consent was lost.
  // If the banner is showing (no consent recorded) but no GTM script
  // is loaded, delete any orphaned GA cookies.
  cleanupStaleCookies() {
    const cookieContainer = document.querySelector('.js-cookies-container')

    // If banner is present, user hasn't consented yet — don't cleanup
    // during this page load (they'll make a choice via the banner)
    if (cookieContainer) {
      return
    }

    // If GTM isn't loaded but GA cookies exist, they're stale — remove them
    const gtmScript = document.querySelector(
      'script[src*="googletagmanager.com/gtm.js"]'
    )

    if (!gtmScript) {
      deleteGoogleAnalyticsCookies()
    }
  },

  // Wire up event listeners for the cookie banner buttons.
  // This is the progressive enhancement layer — it intercepts the
  // default form submission and handles everything via JavaScript.
  setupCookieComponentListeners() {
    const cookieContainer = document.querySelector('.js-cookies-container')

    if (!cookieContainer) {
      return
    }

    const acceptButton = document.querySelector('.js-cookies-button-accept')
    const rejectButton = document.querySelector('.js-cookies-button-reject')
    const acceptedBanner = document.querySelector('.js-cookies-accepted')
    const rejectedBanner = document.querySelector('.js-cookies-rejected')
    const cookieBanner = document.querySelector('.js-cookies-banner')

    // Read server-generated values from data attributes
    const crumb = cookieContainer.dataset.crumb
    const gtmKey = cookieContainer.dataset.gtmKey

    // Send the consent choice to the server via XHR.
    // The crumb (CSRF token) is sent in the JSON body.
    // @hapi/crumb accepts it there for JSON content-type requests.
    //
    // On a 2xx response, onSuccess is called.
    // On any non-2xx or network error, the page form is submitted natively
    // as a fallback so the consent is never silently lost.
    const formElement = cookieContainer.closest('form')

    const submitPreference = (accepted, onSuccess) => {
      const xhr = new XMLHttpRequest() // eslint-disable-line no-undef

      xhr.open('POST', '/cookies', true)
      xhr.setRequestHeader('Content-Type', 'application/json')

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onSuccess()
        } else {
          // Server rejected the request (e.g. stale CSRF token) — fall back
          // to a native form POST so the consent is not silently lost.
          formElement?.submit()
        }
      }

      xhr.onerror = () => {
        // Network failure — fall back to native form POST.
        formElement?.submit()
      }

      xhr.send(
        JSON.stringify({
          analytics: accepted,
          async: true,
          crumb
        })
      )
    }

    // Transition from the question banner to the accepted/rejected
    // confirmation banner. Uses ARIA attributes for screen readers.
    const showBanner = (banner) => {
      const questionBanner = document.querySelector('.js-question-banner')
      questionBanner.setAttribute('hidden', 'hidden')
      banner.removeAttribute('hidden')
      banner.setAttribute('tabindex', '-1')
      banner.focus()

      banner.addEventListener('blur', () => {
        banner.removeAttribute('tabindex')
      })
    }

    // ACCEPT: Show confirmation, load GTM immediately, persist choice.
    // No redirect after XHR — the cookie is persisted server-side.
    // The next natural page navigation will render GTM from the server,
    // avoiding a duplicate page_view from loading GTM twice on the same page.
    acceptButton?.addEventListener('click', (event) => {
      event.preventDefault()
      showBanner(acceptedBanner)
      loadGoogleAnalytics(gtmKey)
      submitPreference(true, () => {})
    })

    // REJECT: Show confirmation, delete GA cookies immediately, persist choice.
    // No redirect — the confirmation banner stays visible and GA cookies are
    // already deleted client-side. Server-side deletion happens on next load.
    rejectButton?.addEventListener('click', (event) => {
      event.preventDefault()
      showBanner(rejectedBanner)
      deleteGoogleAnalyticsCookies()
      submitPreference(false, () => {})
    })

    // "Hide this message" buttons on the confirmation banners
    acceptedBanner?.querySelector('.js-hide').addEventListener('click', () => {
      cookieBanner.setAttribute('hidden', 'hidden')
    })

    rejectedBanner?.querySelector('.js-hide').addEventListener('click', () => {
      cookieBanner.setAttribute('hidden', 'hidden')
    })
  }
}
