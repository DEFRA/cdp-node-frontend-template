import { healthController } from '~/src/app/health/controller'

describe('#healthController', () => {
  const mockViewHandler = {
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  test('Should provide expected response', () => {
    healthController.handler(null, mockViewHandler)

    expect(mockViewHandler.response).toHaveBeenCalledWith({
      message: 'success'
    })
    expect(mockViewHandler.code).toHaveBeenCalledWith(200)
  })
})
