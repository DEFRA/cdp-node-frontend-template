import path from 'path'

import { config } from '~/src/config'
import { createLogger } from '~/src/server/common/helpers/logging/logger'
import { buildNavigation } from '~/src/config/nunjucks/context/build-navigation'

const logger = createLogger()
const assetPath = config.get('assetPath')
const appPathPrefix = config.get('appPathPrefix')

const manifestPath = path.resolve(
  config.get('root'),
  '.public',
  'manifest.json'
)
let webpackManifest

try {
  webpackManifest = require(manifestPath)
} catch (error) {
  logger.error('Webpack Manifest assets file not found')
}

function context(request) {
  return {
    serviceName: config.get('serviceName'),
    breadcrumbs: [],
    navigation: buildNavigation(request),
    getAssetPath: function (asset) {
      const webpackAssetPath = webpackManifest[asset]

      if (!appPathPrefix || appPathPrefix === '/') {
        return `${assetPath}/${webpackAssetPath}`
      } else {
        return `${appPathPrefix}${assetPath}/${webpackAssetPath}`
      }
    }
  }
}

export { context }
