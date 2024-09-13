import { formatDate } from '~/src/config/nunjucks/filters/format-date.js'

describe('#formatDate', () => {
  beforeAll(() => {
    jest.useFakeTimers({
      now: new Date('2023-04-01')
    })
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('With defaults', () => {
    test('Date should be in expected format', () => {
      expect(formatDate('2023-04-08T11:40:02.242Z')).toBe('Sat 8th April 2023')
    })
  })

  describe('With Date object', () => {
    test('Date should be in expected format', () => {
      expect(formatDate(new Date())).toBe('Sat 1st April 2023')
    })
  })

  describe('With format attribute', () => {
    test('Date should be in provided format', () => {
      expect(
        formatDate(
          '2023-04-08T11:40:02.242Z',
          "h:mm aaa 'on' EEEE do MMMM yyyy"
        )
      ).toBe('12:40 pm on Saturday 8th April 2023')
    })
  })
})
