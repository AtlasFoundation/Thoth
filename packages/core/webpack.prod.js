/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv-flow-webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { merge } = require('webpack-merge')

const common = require('./webpack.common')

module.exports = () => {
  const commonConfig = common()

  const prodConfig = {
    mode: 'development',
    optimization: {
      minimize: false,
      minimizer: [new TerserPlugin()],
    },
  }

  return merge(commonConfig, prodConfig)
}
