import { config } from '~/src/config'

const appPathPrefix = config.get('appPathPrefix')
function sanitiseUrlPath(
  path,
  options = { prefix: '', removeTrailingSlashes: true }
) {
  const requestPath =
    options.removeTrailingSlashes ?? true
      ? `${options.prefix}${path}`.replace(/\/+$/, '')
      : `${options.prefix}${path}`

  return `/${requestPath}`.replace(/\/\/+/g, '/')
}

function sanitiseAppPath(requestPath) {
  return sanitiseUrlPath(requestPath, {
    prefix: appPathPrefix,
    removeTrailingSlashes: true
  })
}

export { sanitiseUrlPath, sanitiseAppPath }
