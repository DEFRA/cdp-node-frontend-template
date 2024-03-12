import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation'

const mockRequest = ({ path = '' } = {}) => ({
  path
})

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', async () => {
    expect(await buildNavigation(mockRequest())).toEqual([
      {
        isActive: false,
        text: 'Home',
        url: '/'
      }
    ])
  })
  test('Should provide expected highlighted navigation details', async () => {
    expect(await buildNavigation(mockRequest({ path: '/' }))).toEqual([
      {
        isActive: true,
        text: 'Home',
        url: '/'
      }
    ])
  })
})
