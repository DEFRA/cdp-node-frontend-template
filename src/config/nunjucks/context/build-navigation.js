function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: '/',
      isActive: request.path === '/'
    }
  ]
}

export { buildNavigation }
