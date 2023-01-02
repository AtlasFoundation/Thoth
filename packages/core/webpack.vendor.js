/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  entry: {
    vendor: [
      'lodash',
      'react',
      '@material-ui/core',
      '@mui/material',
      '@reduxjs/toolkit',
      'redux',
      '@feathersjs/client',
      'react-dom',
      'flexlayout-react',
      'jodit-react',
      'react-icons',
    ],
  },
  output: {
    filename: 'vendor.bundle.js',
    path: path.join(__dirname, 'build'),
    library: 'vendor_lib',
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  plugins: [
    new webpack.DllPlugin({
      name: 'vendor_lib',
      path: path.join(__dirname, 'dist', 'vendor-manifest.json'),
    }),
  ],
}
