import path from 'path'
import hapi from '@hapi/hapi'
import { Engine as CatboxRedis } from '@hapi/catbox-redis'
import { Engine as CatboxMemory } from '@hapi/catbox-memory'

import { config } from '~/src/config'
import { nunjucksConfig } from '~/src/config/nunjucks'
import { router } from './router'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger'
import { catchAll } from '~/src/server/common/helpers/errors'
import { secureContext } from '~/src/server/common/helpers/secure-context'
import { buildRedisClient } from '~/src/server/common/helpers/redis-client'
import { sessionCache } from '~/src/server/common/helpers/session-cache/session-cache'
import { createLogger } from '~/src/server/common/helpers/logging/logger'

const isProduction = config.get('isProduction')
const logger = createLogger()

async function createServer() {
  const server = hapi.server({
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      files: {
        relativeTo: path.resolve(config.get('root'), '.public')
      },
      security: {
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: false
        },
        xss: 'enabled',
        noSniff: true,
        xframe: true
      }
    },
    router: {
      stripTrailingSlash: true
    },
    cache: [
      {
        name: config.get('session.cache.name'),
        engine: getCacheEngine()
      }
    ]
  })

  if (isProduction) {
    await server.register(secureContext)
  }

  await server.register([requestLogger, sessionCache, router, nunjucksConfig])

  server.ext('onPreResponse', catchAll)

  return server
}

function getCacheEngine() {
  const redisEnabled = config.get('redis.enabled')
  // If server side caching is required, including anything with yar (e.g. `request.yar.set`) then Redis
  // will need to be set up. Using Catbox Memory will result in intermittent caching failures as the server side
  // cache will be instance specific and not shared amongst instances.
  if (redisEnabled) {
    return new CatboxRedis({
      client: buildRedisClient()
    })
  } else if (isProduction) {
    logger.error('Catbox Memory used in production')
    return new CatboxMemory()
  } else {
    logger.warn(
      'Catbox Memory used for server side cache, this could cause issues if used in production - See README'
    )
    return new CatboxMemory()
  }
}

export { createServer }
