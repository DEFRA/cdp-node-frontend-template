import path from 'path'
import hapi from '@hapi/hapi'

import { config } from '~/src/config/index.js'
import { nunjucksConfig } from '~/src/config/nunjucks/index.js'
import { router } from './router.js'
import { requestLogger } from '~/src/server/common/helpers/logging/request-logger.js'
import { catchAll } from '~/src/server/common/helpers/errors.js'
import { secureContext } from '~/src/server/common/helpers/secure-context/index.js'
import { sessionCache } from '~/src/server/common/helpers/session-cache/session-cache.js'
import { getCacheEngine } from '~/src/server/common/helpers/session-cache/cache-engine.js'
import { pulse } from '~/src/server/common/helpers/pulse.js'

const enablePulse = config.get('enablePulse')

export async function createServer() {
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
        engine: getCacheEngine(config.get('session.cache.engine'))
      }
    ]
  })

  // Hapi Plugins:
  // requestLogger  - automatically logs incoming requests
  // pulse          - provides shutdown handlers
  // secureContext  - loads CA certificates from environment config
  // sessionCache   - sets up in memory cache in development and redis cache in production
  // nunjucksConfig - sets up nunjucks template config
  // router         - routes used in the app

  // Add request logger before all other plugins, so we can see errors
  await server.register(requestLogger)

  if (enablePulse) {
    await server.register(pulse)
  }

  await server.register([secureContext, sessionCache, nunjucksConfig, router])

  server.ext('onPreResponse', catchAll)

  return server
}
