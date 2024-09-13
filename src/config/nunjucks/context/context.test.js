import { context } from '~/src/config/nunjucks/context/context.js'

const mockReadFileSync = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  readFileSync: () => mockReadFileSync
}))
jest.mock('~/src/server/common/helpers/logging/logger.js', () => ({
  createLogger: () => ({ error: (...args) => mockLoggerError(...args) })
}))

describe('#context', () => {
  /** @type {Partial<Request>} */
  const mockRequest = { path: '/' }
  let contextResult

  describe('When webpack manifest file read succeeds', () => {
    beforeEach(() => {
      mockReadFileSync.mockResolvedValue({
        'application.js': 'javascripts/application.js',
        'stylesheets/application.scss': 'stylesheets/application.css'
      })

      // @ts-expect-error - Test mock
      contextResult = context(mockRequest)
    })

    test('Should provide expected context', () => {
      expect(contextResult).toEqual({
        assetPath: '/public/assets',
        breadcrumbs: [],
        getAssetPath: expect.any(Function),
        navigation: [
          {
            isActive: true,
            text: 'Home',
            url: '/'
          },
          {
            isActive: false,
            text: 'About',
            url: '/about'
          }
        ],
        serviceName: 'CDP Node.js Frontend Template',
        serviceUrl: '/'
      })
    })

    test('Should provide expected asset path', () => {
      expect(contextResult.getAssetPath('application.js')).toBe(
        '/public/application.js'
      )
    })
  })

  describe('When webpack manifest file read fails', () => {
    beforeEach(() => {
      mockReadFileSync.mockRejectedValue(new Error('File not found'))

      // @ts-expect-error - Test mock
      contextResult = context(mockRequest)
    })

    test('Should log that the Webpack Manifest file is not available', () => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Webpack assets-manifest.json not found'
      )
    })
  })
})

/**
 * @import {Request} from '@hapi/hapi'
 */
