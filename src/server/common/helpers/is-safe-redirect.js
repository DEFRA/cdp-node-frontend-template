// Open-redirect prevention utility.
//
// When the cookie banner form submits, it includes a returnUrl so the
// server can redirect the user back to the page they were on. An attacker
// could try to inject an external URL (e.g. https://evil.com or //evil.com)
// to redirect users off-site after accepting cookies.
//
// This function ensures the URL:
// - Is a string
// - Starts with "/" (relative to the current origin)
// - Does NOT start with "//" (protocol-relative URL, which would navigate
//   to an external domain)

export function isSafeRedirect(url) {
  if (!url || typeof url !== 'string') {
    return false
  }
  return url.startsWith('/') && !url.startsWith('//')
}
