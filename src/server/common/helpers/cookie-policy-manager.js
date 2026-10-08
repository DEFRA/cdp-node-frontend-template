// Cookie consent policy management.
//
// This module handles the server-side cookie consent state. It is used by
// both the cookies plugin (to inject state into templates) and the cookies
// route (to update the policy when the user submits the form).
//
// KEY DESIGN DECISIONS:
//
// 1. Default policy has analytics: false — no tracking until the user
//    explicitly opts in. This complies with ICO/GDPR requirements.
//
// 2. confirmed: false means the user hasn't made a choice yet, so the
//    cookie banner should be shown.
//
// 3. removeAnalytics() deletes GA cookies SERVER-SIDE using h.unstate().
//    This is essential because:
//    - The user might have JavaScript disabled
//    - The client-side deletion might miss cookies on certain domains
//    - Server-side removal sets Set-Cookie headers with past expiry dates
//    The regex matches all GA cookie patterns: _ga, _ga_*, _gid, _gat_*

import { config } from '#/config/config.js'

const cookieNamePolicy = config.get('cookieConsent.name')
const cookiePolicy = config.get('cookieConsent.policy')
const cookieConfig = config.get('cookieConsent.config')

function getCurrentPolicy(request, h) {
  let cookiesPolicy = request.state[cookieNamePolicy]

  if (!cookiesPolicy) {
    cookiesPolicy = createDefaultPolicy(h)
  }

  return cookiesPolicy
}

function createDefaultPolicy(h) {
  const cookiesPolicy = { confirmed: false, essential: true, analytics: false }

  h.state(cookieNamePolicy, cookiesPolicy, { ...cookiePolicy, ...cookieConfig })

  return cookiesPolicy
}

function updatePolicy(request, h, analytics) {
  const cookiesPolicy = getCurrentPolicy(request, h)

  cookiesPolicy.analytics = analytics
  cookiesPolicy.confirmed = true

  h.state(cookieNamePolicy, cookiesPolicy, { ...cookiePolicy, ...cookieConfig })

  if (!analytics) {
    removeAnalytics(request, h)
  }
}

function removeAnalytics(request, h) {
  // Match all Google Analytics cookie name patterns.
  // h.unstate() tells Hapi to send Set-Cookie headers that expire them.
  // Prefixes: _ga (base), _ga_* (GA4 stream), _gid (daily), _gat_* (throttle), _dc_gtm_* (GTM)
  const googleCookiesRegex = /^_ga$|^_ga_.*$|^_gid$|^_gat_.*$|^_dc_gtm_.*$/

  for (const cookieName of Object.keys(request.state)) {
    if (googleCookiesRegex.test(cookieName)) {
      h.unstate(cookieName)
    }
  }
}

export { getCurrentPolicy, updatePolicy, removeAnalytics }
