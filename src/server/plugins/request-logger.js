import hapiPino from 'hapi-pino'

import { logDestination, loggerOptions } from './logger-options.js'

const pathToIgnore = (_, request) =>
  request.path.startsWith('/public') ||
  request.path === '/health' ||
  request.path === '/favicon.ico'

export const requestLogger = {
  plugin: hapiPino,
  options: {
    ignoreFunc: pathToIgnore,
    ...loggerOptions,
    stream: logDestination
  }
}
