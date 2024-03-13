import { withPathPrefixDecorator } from '~/src/server/common/helpers/app-path-prefix/with-path-prefix-decorator'

describe('#withPrefixDecorator', () => {
  const mockRequest = (appPathPrefix) => ({
    server: {
      app: {
        appPathPrefix
      }
    }
  })

  describe('With appPathPrefix', () => {
    test('Should return expected root prefixed path', () => {
      expect(
        withPathPrefixDecorator(mockRequest('/cdp-node-frontend-template'))('')
      ).toEqual('/cdp-node-frontend-template')
    })

    test('Should return expected prefixed path without trailing slash', () => {
      expect(
        withPathPrefixDecorator(mockRequest('/cdp-node-frontend-template'))('/')
      ).toEqual('/cdp-node-frontend-template')
    })

    test('Should return expected prefixed child path', () => {
      expect(
        withPathPrefixDecorator(mockRequest('/cdp-node-frontend-template'))(
          '/about'
        )
      ).toEqual('/cdp-node-frontend-template/about')
    })

    test('Should return expected prefixed multi-child path', () => {
      expect(
        withPathPrefixDecorator(mockRequest('/cdp-node-frontend-template'))(
          '/about/address'
        )
      ).toEqual('/cdp-node-frontend-template/about/address')
    })
  })

  describe('Without appPathPrefix', () => {
    test('Should return expected not prefixed path', () => {
      expect(withPathPrefixDecorator(mockRequest())('/')).toEqual('/')
    })

    test('Should return expected not prefixed child path', () => {
      expect(withPathPrefixDecorator(mockRequest())('/about')).toEqual('/about')
    })

    test('Should return expected not prefixed multi-child path', () => {
      expect(withPathPrefixDecorator(mockRequest())('/about/address')).toEqual(
        '/about/address'
      )
    })
  })
})
