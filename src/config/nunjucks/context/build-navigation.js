import { sanitiseAppPath } from 'src/server/common/helpers/sanitise-url-path.js'

function buildNavigation(request) {
  return [
    {
      text: 'Home',
      url: sanitiseAppPath('/'),
      isActive: request.path === sanitiseAppPath('/')
    }
  ]
}

export { buildNavigation }
