function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: request.withPrefix('/'),
      isActive: request.path === request.withPrefix('/')
    },
    {
      text: 'About',
      url: request.withPrefix('/about'),
      isActive: request.path === request.withPrefix('/about')
    }
  ]
}

export { buildNavigation }
