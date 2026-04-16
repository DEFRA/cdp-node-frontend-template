import path from 'node:path'
import { readFileSync } from 'node:fs'

import { config } from '#/config/config.js'
import { buildNavigation } from './build-navigation.js'
import { createLogger } from '#/server/common/helpers/logging/logger.js'

const logger = createLogger()
const assetPath = config.get('assetPath')

/**
 * Get asset path from .public/.vite/manifest.json
 * @param {string} asset
 * @returns {string}
 */
function getAssetPath(asset) {
  if (!config.get('isProduction')) {
    return `${assetPath}/${asset}`
  }

  const manifestPath = path.join(
    config.get('root'),
    '.public/.vite/manifest.json'
  )

  let viteManifest

  if (!viteManifest) {
    try {
      viteManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch (error) {
      logger.error(error, `Vite ${path.basename(manifestPath)} not found`)
    }
  }

  const webpackAssetPath = viteManifest[`${asset}`]?.file ?? ''

  return `${assetPath}/${webpackAssetPath}`
}

export function context(request) {
  return {
    assetPath: `${assetPath}/assets`,
    serviceName: config.get('serviceName'),
    serviceUrl: '/',
    breadcrumbs: [],
    navigation: buildNavigation(request),
    getAssetPath
  }
}
