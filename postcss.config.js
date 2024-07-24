import autoprefixer from 'autoprefixer'

/**
 * @type {Config}
 */
export default {
  plugins: [
    autoprefixer({
      env: 'stylesheets'
    })
  ]
}

/**
 * @import { Config } from 'postcss-load-config'
 */
