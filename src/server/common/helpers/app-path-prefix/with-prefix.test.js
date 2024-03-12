import { withPrefix } from 'src/server/common/helpers/app-path-prefix/with-prefix'

describe('#withPrefix', () => {
  test('Should return empty when prefix is empty and request path is empty', () => {
    expect(withPrefix('', '')).toEqual('')
  })
  test('Should return / when prefix is empty and request path is /', () => {
    expect(withPrefix('/', '')).toEqual('/')
  })
  test('Should return /about when prefix is empty and request path is /about', () => {
    expect(withPrefix('/about', '')).toEqual('/about')
  })
  test('Should return /about/address when prefix is empty and request path is /about/address', () => {
    expect(withPrefix('/about/address', '')).toEqual('/about/address')
  })
  test('Should return /prefix when prefix is /prefix and request path is empty', () => {
    expect(withPrefix('', '/prefix')).toEqual('/prefix')
  })
  test('Should return /prefix when prefix is /prefix and request path is /', () => {
    expect(withPrefix('/', '/prefix')).toEqual('/prefix')
  })
  test('Should return /prefix/about when prefix is /prefix and request path is /about', () => {
    expect(withPrefix('/about', '/prefix')).toEqual('/prefix/about')
  })
  test('Should return /prefix/about/address when prefix is /prefix and request path is /about/address', () => {
    expect(withPrefix('/about/address', '/prefix')).toEqual(
      '/prefix/about/address'
    )
  })
})
