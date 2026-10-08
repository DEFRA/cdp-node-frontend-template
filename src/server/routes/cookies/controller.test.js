import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import { cookiesModel } from '#/server/routes/cookies/controller.js'
import * as cheerio from 'cheerio'
import { createServer } from '../../server.js'
import { config } from '#/config/config.js'

describe('cookiesModel', () => {
  test('returns analytics radios with no checked when no policy', () => {
    const result = cookiesModel(false)

    expect(result.analytics.items[0].checked).toBe(undefined)
    expect(result.analytics.items[1].checked).toBe(true)
    expect(result.updated).toBe(false)
  })

  test('returns analytics radios with Yes checked when analytics accepted', () => {
    const result = cookiesModel(false, { analytics: true })

    expect(result.analytics.items[0].checked).toBe(true)
    expect(result.analytics.items[1].checked).toBe(false)
  })

  test('returns analytics radios with No checked when analytics rejected', () => {
    const result = cookiesModel(false, { analytics: false })

    expect(result.analytics.items[0].checked).toBe(false)
    expect(result.analytics.items[1].checked).toBe(true)
  })

  test('sets updated to true when preferences saved', () => {
    const result = cookiesModel(true)

    expect(result.updated).toBe(true)
  })
})

describe('Cookies route', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('GET /cookies returns 200', async () => {
    const response = await server.inject({ method: 'GET', url: '/cookies' })

    expect(response.statusCode).toBe(200)
  })

  test('GET /cookies renders cookie policy page', async () => {
    const response = await server.inject({ method: 'GET', url: '/cookies' })

    expect(response.request.response.source.template).toBe('cookies/policy')
  })

  test('GET /cookies has correct page title', async () => {
    const response = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(response.payload)

    expect($('title').text()).toContain('Cookies')
    expect($('title').text()).toContain(config.get('serviceName'))
  })

  test('GET /cookies shows analytics radio buttons', async () => {
    const response = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(response.payload)

    expect($('input[name="analytics"]').length).toBe(2)
  })

  test('GET /cookies has cookie tables', async () => {
    const response = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(response.payload)

    expect($('.govuk-table').length).toBe(2)
    expect(response.payload).toContain(config.get('cookieConsent.name'))
    expect(response.payload).toContain('_ga')
  })

  test('POST /cookies returns 200 if async', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: true,
        crumb
      }
    })

    expect(result.statusCode).toBe(200)
  })

  test('POST /cookies returns success JSON if async', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: true,
        crumb
      }
    })

    expect(JSON.parse(result.payload)).toStrictEqual({ message: 'success' })
  })

  test('POST /cookies invalid payload returns 400', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        invalid: 'aaaaaa',
        crumb
      }
    })

    expect(result.statusCode).toBe(400)
  })

  test('POST /cookies with valid returnUrl redirects', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: false,
        returnUrl: '/',
        crumb
      }
    })

    expect(result.statusCode).toBe(302)
    expect(result.headers.location).toBe('/')
  })

  test('POST /cookies with external returnUrl redirects to /cookies?updated=true', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: false,
        returnUrl: 'https://evil.example.com',
        crumb
      }
    })

    expect(result.statusCode).toBe(302)
    expect(result.headers.location).toBe('/cookies?updated=true')
  })

  test('POST /cookies with protocol-relative returnUrl redirects to /cookies?updated=true', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: false,
        async: false,
        returnUrl: '//evil.example.com',
        crumb
      }
    })

    expect(result.statusCode).toBe(302)
    expect(result.headers.location).toBe('/cookies?updated=true')
  })

  test('POST /cookies with returnUrl exceeding 2000 chars returns 400', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: false,
        returnUrl: '/' + 'a'.repeat(2001),
        crumb
      }
    })

    expect(result.statusCode).toBe(400)
  })

  test('POST /cookies sync without returnUrl redirects to /cookies?updated=true', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: true,
        async: false,
        crumb
      }
    })

    expect(result.statusCode).toBe(302)
    expect(result.headers.location).toBe('/cookies?updated=true')
  })

  test('GET /cookies?updated=true renders policy with success banner', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/cookies?updated=true'
    })
    const $ = cheerio.load(response.payload)

    expect(response.statusCode).toBe(200)
    expect($('.govuk-notification-banner--success').length).toBe(1)
  })

  test('Cookie banner appears on cookie page when no cookie set', async () => {
    const response = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(response.payload)

    expect($('.govuk-cookie-banner').length).toBe(1)
    expect($('.js-cookies-button-accept').text()).toContain(
      'Accept analytics cookies'
    )
    expect($('.js-cookies-button-reject').text()).toContain(
      'Reject analytics cookies'
    )
  })

  test('POST /cookies without analytics field returns 400', async () => {
    // analytics is required — omitting it must be rejected so the server never
    // records an ambiguous confirmed:true / analytics:undefined state.
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    const result = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        async: false,
        crumb
        // analytics intentionally omitted
      }
    })

    expect(result.statusCode).toBe(400)
  })

  test('GET /cookies has Cache-Control: no-store header', async () => {
    const response = await server.inject({ method: 'GET', url: '/cookies' })

    expect(response.headers['cache-control']).toBe('no-store')
  })

  test('POST /cookies sync view response has Cache-Control: no-store header', async () => {
    const getResponse = await server.inject({ method: 'GET', url: '/cookies' })
    const $ = cheerio.load(getResponse.payload)
    const cookies = getResponse.headers['set-cookie']
    const crumb = $('input[name="crumb"]').val()

    // POST redirects (PRG pattern), so check the resulting GET carries no-store
    const postResult = await server.inject({
      method: 'POST',
      url: '/cookies',
      headers: {
        cookie: cookies ? cookies.join(';') : ''
      },
      payload: {
        analytics: false,
        async: false,
        crumb
      }
    })

    expect(postResult.statusCode).toBe(302)

    const getResult = await server.inject({
      method: 'GET',
      url: postResult.headers.location,
      headers: {
        cookie: postResult.headers['set-cookie']
          ? [postResult.headers['set-cookie']].flat().join(';')
          : ''
      }
    })

    expect(getResult.headers['cache-control']).toBe('no-store')
  })

  test('does not expire GA cookies on first visit before user has made a choice', async () => {
    // On first visit the consent cookie is absent — confirmed is false.
    // The server must not send Set-Cookie expiry headers for GA cookies
    // until the user explicitly rejects analytics.
    const firstVisit = await server.inject({
      method: 'GET',
      url: '/cookies',
      headers: {
        cookie:
          '_ga=GA1.1.123456789.1234567890; _gid=GA1.1.987654321.1234567890'
      }
    })

    const setCookieHeaders = [firstVisit.headers['set-cookie']]
      .flat()
      .filter(Boolean)
    const expiresGa = setCookieHeaders.some(
      (h) =>
        (h.startsWith('_ga') || h.startsWith('_gid')) &&
        h.includes('expires=Thu, 01 Jan 1970')
    )

    expect(expiresGa).toBe(false)
  })
})
