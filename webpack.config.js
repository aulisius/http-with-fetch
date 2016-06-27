const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './test.js',
  output: {
    path: 'dist',
    filename: 'http.min.js',
    publicPath: '/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: path.join(__dirname, 'node_modules')
      },
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: true,
      compress: {
        warnings: false
      }
    })
  ]
}
