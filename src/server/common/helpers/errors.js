import { statusCodes } from '~/src/server/common/constants/status-codes.js'

/**
 * @param {number} statusCode
 */
function statusCodeMessage(statusCode) {
  switch (true) {
    case statusCode === statusCodes.notFound:
      return 'Page not found'
    case statusCode === statusCodes.forbidden:
      return 'Forbidden'
    case statusCode === statusCodes.unauthorized:
      return 'Unauthorized'
    case statusCode === statusCodes.badRequest:
      return 'Bad Request'
    default:
      return 'Something went wrong'
  }
}

/**
 * @param {Request} request
 * @param {ResponseToolkit} h
 */
export function catchAll(request, h) {
  const { response } = request

  if (!('isBoom' in response)) {
    return h.continue
  }

  request.logger.error(response?.stack)

  const statusCode = response.output.statusCode
  const errorMessage = statusCodeMessage(statusCode)

  return h
    .view('error/index', {
      pageTitle: errorMessage,
      heading: statusCode,
      message: errorMessage
    })
    .code(statusCode)
}

/**
 * @import { Request, ResponseToolkit } from '@hapi/hapi'
 */
