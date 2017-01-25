const path = require('path')
const webpack = require('webpack')
const webConfig = {
  entry: path.resolve(__dirname, 'src', 'lib.js'),
  output: {
    filename: 'lib.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'http-with-fetch',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: 'babel-loader'
      }
    ]
  },
	plugins: [
		new webpack.optimize.UglifyJsPlugin({})
	]	
}

module.exports = webConfig

