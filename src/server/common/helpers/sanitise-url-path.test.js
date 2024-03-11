import { sanitiseUrlPath } from 'src/server/common/helpers/sanitise-url-path.js'

describe('#sanitisePath', () => {
  const emptyPrefix = { prefix: '', removeTrailingSlashes: true }
  const slashPrefix = { prefix: '/', removeTrailingSlashes: true }
  const prefix = { prefix: '/prefix', removeTrailingSlashes: true }

  test('Should return / when prefix is empty and request path is empty', () => {
    expect(sanitiseUrlPath('', emptyPrefix)).toEqual('/')
  })
  test('Should return / when prefix is empty and request path is /', () => {
    expect(sanitiseUrlPath('/', emptyPrefix)).toEqual('/')
  })
  test('Should return /about when prefix is empty and request path is /about', () => {
    expect(sanitiseUrlPath('/about', emptyPrefix)).toEqual('/about')
  })
  test('Should return /about/address when prefix is empty and request path is /about/address', () => {
    expect(sanitiseUrlPath('/about/address', emptyPrefix)).toEqual(
      '/about/address'
    )
  })
  test('Should return / when prefix is / and request path is empty', () => {
    expect(sanitiseUrlPath('', slashPrefix)).toEqual('/')
  })
  test('Should return / when prefix is / and request path is /', () => {
    expect(sanitiseUrlPath('/', slashPrefix)).toEqual('/')
  })
  test('Should return /about when prefix is / and request path is /about', () => {
    expect(sanitiseUrlPath('/about', slashPrefix)).toEqual('/about')
  })
  test('Should return /about/address when prefix is / and request path is /about/address', () => {
    expect(sanitiseUrlPath('/about/address', slashPrefix)).toEqual(
      '/about/address'
    )
  })
  test('Should return /about/address when prefix is / and request path is /about/address/// and removeTrailingSlashes is false', () => {
    expect(
      sanitiseUrlPath('/about/address///', {
        prefix: '/',
        removeTrailingSlashes: false
      })
    ).toEqual('/about/address/')
  })
  test('Should return /prefix when prefix is /prefix and request path is empty', () => {
    expect(sanitiseUrlPath('', prefix)).toEqual('/prefix')
  })
  test('Should return /prefix when prefix is /prefix and request path is /', () => {
    expect(sanitiseUrlPath('/', prefix)).toEqual('/prefix')
  })
  test('Should return /prefix/about when prefix is /prefix and request path is /about', () => {
    expect(sanitiseUrlPath('/about', prefix)).toEqual('/prefix/about')
  })
  test('Should return /prefix/about/address when prefix is /prefix and request path is /about/address', () => {
    expect(sanitiseUrlPath('/about/address', prefix)).toEqual(
      '/prefix/about/address'
    )
  })
  test('Should return /prefix/about/address when prefix is /prefix and request path is //about///address///', () => {
    expect(sanitiseUrlPath('//about///address///', prefix)).toEqual(
      '/prefix/about/address'
    )
  })
})
