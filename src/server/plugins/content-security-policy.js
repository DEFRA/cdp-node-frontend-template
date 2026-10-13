import Blankie from 'blankie'

/**
 * Manage content security policies.
 * @satisfies {import('@hapi/hapi').Plugin}
 */
const contentSecurityPolicy = {
  plugin: Blankie,
  options: {
    defaultSrc: ['self'],
    connectSrc: [
      'self',
      'wss',
      'data:',
      'https://www.google.com',
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com'
    ],
    imgSrc: ['self', 'data:'],
    mediaSrc: ['self'],
    frameSrc: ['https://www.googletagmanager.com'],
    fontSrc: ['self', 'data:'],
    objectSrc: ['none'],
    scriptSrc: [
      'self',
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
      'https://*.googletagmanager.com',
      'https://*.google-analytics.com'
    ],
    styleSrc: ['self'],
    frameAncestors: ['none'],
    formAction: ['self'],
    manifestSrc: ['self'],
    generateNonces: true
  }
}

export { contentSecurityPolicy }
