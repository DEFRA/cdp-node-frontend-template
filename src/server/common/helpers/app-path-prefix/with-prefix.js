import { config } from '~/src/config'

const appPathPrefix = config.get('appPathPrefix')

function withPrefix(url, prefix = appPathPrefix) {
  return prefix ? `${prefix}${url}`.replace(/\/+$/, '') : url
}

export { withPrefix }
