import hapi from '@hapi/hapi'

import { secureContext } from '~/src/server/common/helpers/secure-context/secure-context.js'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger.js'
import { config } from '~/src/config/index.js'

const mockAddCACert = jest.fn()
const mockTlsCreateSecureContext = jest
  .fn()
  .mockReturnValue({ context: { addCACert: mockAddCACert } })

jest.mock('node:tls', () => ({
  ...jest.requireActual('node:tls'),
  createSecureContext: (...args) => mockTlsCreateSecureContext(...args)
}))

describe('#secureContext', () => {
  /** @type {Server & {secureContext?: {}}} */
  let server
  let loggerSpy

  describe('When secure context is disabled', () => {
    beforeEach(async () => {
      config.set('isSecureContextEnabled', false)
      server = hapi.server()
      await server.register(requestLogger)

      loggerSpy = jest.spyOn(server.logger, 'info')
      await server.register(secureContext)
    })

    afterEach(async () => {
      await server.stop({ timeout: 0 })
    })

    test('secureContext decorator should not be available', () => {
      expect(loggerSpy).toHaveBeenCalledWith(
        'Custom secure context is disabled'
      )
    })

    test('Logger should give us disabled message', () => {
      expect(server.secureContext).toBeUndefined()
    })
  })

  describe('When secure context is enabled', () => {
    const PROCESS_ENV = process.env

    beforeAll(() => {
      process.env = { ...PROCESS_ENV }
      process.env.TRUSTSTORE_ONE = 'mock-trust-store-cert-one'
    })

    beforeEach(async () => {
      config.set('isSecureContextEnabled', true)
      server = hapi.server()
      await server.register([requestLogger, secureContext])
    })

    afterEach(async () => {
      await server.stop({ timeout: 0 })
    })

    afterAll(() => {
      process.env = PROCESS_ENV
    })

    test('Original tls.createSecureContext should have been called', () => {
      expect(mockTlsCreateSecureContext).toHaveBeenCalledWith({})
    })

    test('addCACert should have been called', () => {
      expect(mockAddCACert).toHaveBeenCalled()
    })

    test('secureContext decorator should be available', () => {
      expect(server.secureContext).toEqual({
        context: { addCACert: expect.any(Function) }
      })
    })
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
