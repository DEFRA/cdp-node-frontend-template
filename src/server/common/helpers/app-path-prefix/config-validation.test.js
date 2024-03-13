import { appPathPrefixConfigValidation } from '~/src/server/common/helpers/app-path-prefix/config-validation'
import { getError } from '~/test-helpers/get-error'

describe('#appPathPrefixConfigValidation', () => {
  test('With correct appPathPrefix, should not error', () => {
    expect(() =>
      appPathPrefixConfigValidation('/cdp-node-frontend-template')
    ).not.toThrow()
  })

  test('With double correct appPathPrefix, should not error', () => {
    expect(() =>
      appPathPrefixConfigValidation('/cdp-node-frontend-template/new')
    ).not.toThrow()
  })

  test('With empty appPathPrefix, should not error', () => {
    expect(() => appPathPrefixConfigValidation('')).not.toThrow()
  })

  test('With single slash, should provide expected error message', () => {
    const value = '/'
    const error = getError(() => appPathPrefixConfigValidation(value))

    expect(error).toHaveProperty(
      'message',
      `appPathPrefix ${value} should start with / contain characters and not end with a trailing /`
    )
  })

  test('With a mid path double slash, should provide expected error message', () => {
    const value = '/cdp-node-frontend-template//new'
    const error = getError(() => appPathPrefixConfigValidation(value))

    expect(error).toHaveProperty(
      'message',
      `appPathPrefix ${value} should be a valid path`
    )
  })

  test('With double starting slash, should provide expected error message', () => {
    const value = '//cdp-node-frontend-template'
    const error = getError(() => appPathPrefixConfigValidation(value))

    expect(error).toHaveProperty(
      'message',
      `appPathPrefix ${value} should be a valid path`
    )
  })

  test('With a slash at the end, should provide expected error message', () => {
    const value = '/cdp-node-frontend-template/'
    const error = getError(() => appPathPrefixConfigValidation(value))

    expect(error).toHaveProperty(
      'message',
      `appPathPrefix ${value} should not end with a trailing /`
    )
  })
})
