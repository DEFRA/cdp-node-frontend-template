/**
 * Aws embedded metrics wrapper
 * @param {Request} request
 * @param {string} metricName
 * @param {number} value
 * @returns {Promise<void>}
 */
export async function metricsCounter(request, metricName, value = 1) {
  // decorated on server and request from "@defra/cdp-metrics"
  // https://github.com/DEFRA/cdp-libraries/tree/main/packages/cdp-metrics
  await request.metrics().counter('download-received', value)
  // alternative if server and request decoration isn't desired
  const metrics = new Metrics(request.logger)
  metrics.counter('download-received', value)
}
