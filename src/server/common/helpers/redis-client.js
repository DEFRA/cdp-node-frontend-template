import { Cluster, Redis } from 'ioredis'

import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

/**
 * Setup Redis and provide a redis client
 *
 * Local development - 1 Redis instance
 * Environments - Elasticache / Redis Cluster with username and password
 * @param {RedisConfig} redisConfig - Redis config
 * @returns {Redis|Cluster}
 */
export function buildRedisClient(redisConfig) {
  const logger = createLogger()
  const port = 6379
  const db = 0
  const keyPrefix = redisConfig.keyPrefix
  const host = redisConfig.host

  const client = redisConfig.useSingleInstanceCache
    ? new Redis({ port, host, db, keyPrefix })
    : new Cluster([{ host, port }], {
        keyPrefix,
        slotsRefreshTimeout: 2000,
        dnsLookup: (address, callback) => callback(null, address),
        redisOptions: {
          username: redisConfig.username,
          password: redisConfig.password,
          db,
          tls: {}
        }
      })

  client.on('connect', () => {
    logger.info('Connected to Redis server')
  })

  client.on('error', (error) => {
    logger.error(`Redis connection error ${error}`)
  })

  return client
}

/**
 * @typedef {object} RedisConfig
 * @property {boolean} enabled
 * @property {string} host
 * @property {string} username
 * @property {string} password
 * @property {string} keyPrefix
 * @property {boolean} useSingleInstanceCache
 */
