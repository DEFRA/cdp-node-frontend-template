import tls from 'node:tls'

import { config } from '~/src/config/index.js'
import { getTrustStoreCerts } from '~/src/server/common/helpers/secure-context/get-trust-store-certs.js'

const enableSecureContext = config.get('enableSecureContext')
/**
 * Creates a new secure context loaded from Base64 encoded certs
 * @satisfies {ServerRegisterPluginObject<void>}
 */
export const secureContext = {
  plugin: {
    name: 'secure-context',
    register(server) {
      if (enableSecureContext) {
        const originalCreateSecureContext = tls.createSecureContext

        tls.createSecureContext = function (options = {}) {
          const trustStoreCerts = getTrustStoreCerts(process.env)

          if (!trustStoreCerts.length) {
            server.logger.info('Could not find any TRUSTSTORE_ certificates')
          }

          const secureContext = originalCreateSecureContext(options)

          trustStoreCerts.forEach((cert) => {
            secureContext.context.addCACert(cert)
          })

          server.logger.info('Custom secure context enabled')

          return secureContext
        }
      }

      server.decorate('server', 'getSecureContext', tls.createSecureContext)
    }
  }
}

/**
 * @import { ServerRegisterPluginObject } from '@hapi/hapi'
 */
