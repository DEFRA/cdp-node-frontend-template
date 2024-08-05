import hapi from '@hapi/hapi'
import { router } from '~/src/server/router.js'

describe('#healthController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = hapi.server()
    await server.register([router])
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop()
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/health'
    })

    expect(result).toEqual({ message: 'success' })
    expect(statusCode).toBe(200)
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */
