import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { getCacheEngine } from '~/src/server/common/helpers/session-cache/cache-engine.js'
import { config } from '~/src/config/index.js'

const mockLoggerInfo = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@hapi/catbox-redis')
jest.mock('@hapi/catbox-memory')
jest.mock('~/src/server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({
    info: (...args) => mockLoggerInfo(...args),
    error: (...args) => mockLoggerError(...args)
  })
}))

describe('#getCacheEngine', () => {
  describe('When Redis cache engine has been requested', () => {
    beforeEach(() => {
      getCacheEngine('redis')
    })

    test('Should log expected message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith('Using Redis session cache')
    })

    test('Should setup Redis cache', () => {
      expect(CatboxRedis).toHaveBeenCalledWith(expect.any(Object))
    })
  })

  describe('When In memory cache engine has been requested', () => {
    beforeEach(() => {
      getCacheEngine()
    })

    test('Should log expected message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Using Catbox Memory session cache'
      )
    })

    test('Should setup In memory cache', () => {
      expect(CatboxMemory).toHaveBeenCalledTimes(1)
    })
  })

  describe('When In memory cache engine has been requested in Production', () => {
    beforeEach(() => {
      config.set('isProduction', true)
      getCacheEngine()
    })

    test('Should log Production warning message', () => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Catbox Memory is for local development only, it should not be used in production!'
      )
    })

    test('Should log expected message', () => {
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Using Catbox Memory session cache'
      )
    })

    test('Should setup In memory cache', () => {
      expect(CatboxMemory).toHaveBeenCalledTimes(1)
    })
  })
})
