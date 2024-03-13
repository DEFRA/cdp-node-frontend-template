function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: request.withPathPrefix('/'),
      isActive: request.path === request.withPathPrefix('/')
    },
    {
      text: 'About',
      url: request.withPathPrefix('/about'),
      isActive: request.path === request.withPathPrefix('/about')
    }
  ]
}

export { buildNavigation }
