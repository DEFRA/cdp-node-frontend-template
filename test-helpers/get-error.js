function getError(func) {
  try {
    func()
  } catch (error) {
    return error
  }
}

export { getError }
