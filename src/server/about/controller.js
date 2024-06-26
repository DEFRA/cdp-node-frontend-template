/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */
const aboutController = {
  handler(request, h) {
    return h.view('about/index', {
      pageTitle: 'About',
      heading: 'About',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'About'
        }
      ]
    })
  }
}

export { aboutController }

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */
