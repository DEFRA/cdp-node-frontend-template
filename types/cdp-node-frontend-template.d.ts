import { SecureContextOptions, SecureContext } from 'tls'

declare module '@hapi/hapi' {
  // Add additions to the Hapi Request interface here
  // interface Request {}

  interface Server {
    getSecureContext: (options?: SecureContextOptions) => SecureContext
  }
}
