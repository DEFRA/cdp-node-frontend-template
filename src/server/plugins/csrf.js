// CSRF protection using @hapi/crumb.
//
// Crumb generates a unique token per request and validates it on POST
// submissions. This prevents cross-site request forgery attacks where
// a malicious site could trick a user's browser into submitting the
// cookie consent form.
//
// HOW IT WORKS:
// 1. Crumb sets an httpOnly cookie containing the CSRF token
// 2. The token is made available in templates as {{ crumb }}
// 3. Forms include it as a hidden input: <input name="crumb" value="{{ crumb }}">
// 4. On POST, Crumb checks the submitted token matches the cookie
// 5. If they don't match, the request is rejected with 403 Forbidden
//
// For JSON (async) requests from JavaScript, the crumb is sent in the
// request body — the client reads it from a data-crumb attribute on
// the cookie banner element.

import Crumb from '@hapi/crumb'
import { config } from '#/config/config.js'

export const csrf = {
  plugin: Crumb,
  options: {
    cookieOptions: {
      // Only set Secure flag in production (HTTPS).
      // In development (HTTP), Secure cookies won't be sent.
      isSecure: config.get('isProduction')
    }
  }
}
