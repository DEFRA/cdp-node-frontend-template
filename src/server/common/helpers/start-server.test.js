import hapi from '@hapi/hapi'

import * as serverCreate from '~/src/server/index.js'
import { startServer } from '~/src/server/common/helpers/start-server.js'

const mockLoggerInfo = jest.fn()
const mockLoggerError = jest.fn()

// TODO can this become a manual mock?
jest.mock('hapi-pino', () => ({
  register: (server) => {
    server.decorate('server', 'logger', {
      info: jest.fn(),
      error: jest.fn()
    })
  },
  name: 'mock-hapi-pino'
}))
jest.mock('~/src/server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args),
    error: (...args) => mockLoggerError(...args)
  })
}))

describe('#startServer', () => {
  const createServerSpy = jest.spyOn(serverCreate, 'createServer')
  const hapiServerSpy = jest.spyOn(hapi, 'server')

  describe('When server starts', () => {
    let server

    beforeEach(async () => {
      server = await startServer()
    })

    afterEach(async () => {
      await server.stop({ timeout: 0 })
    })

    test('Should call createServer', () => {
      expect(createServerSpy).toHaveBeenCalled()
    })

    test('Should call hapi.server', () => {
      expect(hapiServerSpy).toHaveBeenCalled()
    })

    test('Should log cache startup message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Using Catbox Memory session cache'
      )
    })

    test('Should log server startup messages', () => {
      expect(server.logger.info).toHaveBeenCalledWith(
        'Server started successfully'
      )
      expect(server.logger.info).toHaveBeenCalledWith(
        'Access your frontend on http://localhost:3000'
      )
    })
  })

  describe('When server start fails', () => {
    beforeEach(async () => {
      await startServer()
      createServerSpy.mockRejectedValue(new Error('Server failed to start'))
    })

    test('Should log cache startup message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Using Catbox Memory session cache'
      )
    })

    test('Should log server failed to start message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith('Server failed to start :(')
    })

    test('Should log error', () => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        Error('Server failed to start')
      )
    })
  })
})
