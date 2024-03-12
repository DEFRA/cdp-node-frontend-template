import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation'
import { withPrefix } from '~/src/server/common/helpers/app-path-prefix/with-prefix'

const mockRequest = ({ path = '', appPathPrefix } = {}) => ({
  path,
  withPrefix: (url) => withPrefix(url, appPathPrefix)
})

describe('#buildNavigation', () => {
  describe('Without appPathPrefix', () => {
    test('Should provide expected navigation details', () => {
      expect(buildNavigation(mockRequest())).toEqual([
        {
          isActive: false,
          text: 'Home',
          url: '/'
        },
        {
          isActive: false,
          text: 'About',
          url: '/about'
        }
      ])
    })

    test('Should provide expected highlighted navigation details', () => {
      expect(buildNavigation(mockRequest({ path: '/' }))).toEqual([
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
      ])
    })
  })

  describe('With appPathPrefix', () => {
    test('Should provide expected navigation details', () => {
      expect(
        buildNavigation(
          mockRequest({ appPathPrefix: '/cdp-node-frontend-template' })
        )
      ).toEqual([
        {
          isActive: false,
          text: 'Home',
          url: '/cdp-node-frontend-template'
        },
        {
          isActive: false,
          text: 'About',
          url: '/cdp-node-frontend-template/about'
        }
      ])
    })

    test('Should provide expected highlighted navigation details', () => {
      expect(
        buildNavigation(
          mockRequest({
            path: '/cdp-node-frontend-template',
            appPathPrefix: '/cdp-node-frontend-template'
          })
        )
      ).toEqual([
        {
          isActive: true,
          text: 'Home',
          url: '/cdp-node-frontend-template'
        },
        {
          isActive: false,
          text: 'About',
          url: '/cdp-node-frontend-template/about'
        }
      ])
    })
  })
})
