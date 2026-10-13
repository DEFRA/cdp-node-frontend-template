import Joi from 'joi'
import { config } from '#/config/config.js'
import { isSafeRedirect } from '#/server/common/helpers/is-safe-redirect.js'
import { updatePolicy } from '#/server/common/helpers/cookie-policy-manager.js'

export const cookiePolicyController = {
  method: 'GET',
  path: '/cookies',
  options: {
    validate: {
      query: Joi.object({
        updated: Joi.boolean().default(false)
      })
    }
  },
  handler: function (request, h) {
    return h.view('cookies/policy', {
      pageTitle: 'Cookies',
      ...cookiesModel(
        request.query.updated,
        request.state[config.get('cookieConsent.name')]
      )
    })
  }
}

export const updateCookiePreferencesController = {
  method: 'POST',
  path: '/cookies',
  options: {
    validate: {
      payload: Joi.object().keys({
        analytics: Joi.boolean().required(),
        async: Joi.boolean().default(false),
        returnUrl: Joi.string().allow('').max(2000).optional()
      })
    }
  },
  handler: function (request, h) {
    const payload = request.payload

    updatePolicy(request, h, payload.analytics)

    // Async mode — return JSON for the XHR request from client-side JS
    if (payload.async) {
      return h.response({ message: 'success' })
    }

    // Synchronous mode from banner — redirect back to the original page
    if (isSafeRedirect(payload.returnUrl)) {
      return h.redirect(payload.returnUrl)
    }

    // Synchronous mode from preferences page — redirect back with ?updated=true
    // so the browser lands on a GET, preventing the ERR_CACHE_MISS / form
    // resubmit dialog when the user later clicks Back.
    return h.redirect('/cookies?updated=true')
  }
}

export function cookiesModel(updated, cookiesPolicy = {}) {
  return {
    analytics: {
      idPrefix: 'analytics',
      name: 'analytics',
      fieldset: {
        legend: {
          text: 'Do you want to accept analytics cookies?',
          classes: 'govuk-fieldset__legend--s'
        }
      },
      items: [
        {
          value: true,
          text: 'Yes',
          checked: cookiesPolicy.analytics
        },
        {
          value: false,
          text: 'No',
          checked: !cookiesPolicy.analytics
        }
      ]
    },
    updated
  }
}

export const cookies = {
  plugin: {
    name: 'cookies',
    register(server) {
      server.route([cookiePolicyController, updateCookiePreferencesController])
    }
  }
}
