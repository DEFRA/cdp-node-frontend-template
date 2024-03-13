function withPathPrefix(url, prefix) {
  return prefix ? `${prefix}${url}`.replace(/\/+$/, '') : url
}

function withPathPrefixDecorator(request) {
  return (url) => withPathPrefix(url, request.server.app?.appPathPrefix)
}

export { withPathPrefixDecorator }
