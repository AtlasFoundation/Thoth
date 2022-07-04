/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const LicenseWebpackPlugin =
  require('license-webpack-plugin').LicenseWebpackPlugin
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = () => {
  const config = {
    entry: {
      index: ['regenerator-runtime/runtime.js', './index.ts'],
      server: ['regenerator-runtime/runtime.js', './server.ts'],
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
      library: {
        name: 'thothCore',
        type: 'umd',
      },
      globalObject: 'this',
    },
    externals: {
      react: 'react',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        handlebars: 'handlebars/dist/handlebars.js',
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              outDir: './dist',
            },
          },
        },
        {
          test: /\.(css|scss)$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
          use: ['file-loader'],
        },
      ],
    },
    plugins: [new LicenseWebpackPlugin()],
  }

  const isAnalyze = typeof process.env.BUNDLE_ANALYZE !== 'undefined'

  if (isAnalyze) {
    config.plugins.push(new BundleAnalyzerPlugin())
  }

  return config
}
