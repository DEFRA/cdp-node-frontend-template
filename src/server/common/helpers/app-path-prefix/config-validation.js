function appPathPrefixConfigValidation(value) {
  if (value === '/') {
    throw new Error(
      `appPathPrefix ${value} should start with / contain characters and not end with a trailing /`
    )
  }

  if (value && !value.startsWith('/')) {
    throw new Error(`appPathPrefix ${value} should start with /`)
  }

  if (/\/\/+/g.test(value)) {
    throw new Error(`appPathPrefix ${value} should be a valid path`)
  }

  if (value.endsWith('/')) {
    throw new Error(`appPathPrefix ${value} should not end with a trailing /`)
  }
}

export { appPathPrefixConfigValidation }
