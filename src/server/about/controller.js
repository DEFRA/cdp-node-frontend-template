const aboutController = {
  handler: (request, h) => {
    return h.view('about/index', {
      pageTitle: 'About',
      heading: 'About',
      breadcrumbs: [
        {
          text: 'Home',
          href: request.withPathPrefix('/')
        },
        {
          text: 'About'
        }
      ]
    })
  }
}

export { aboutController }
