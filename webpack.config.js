var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = [{
  entry: {
    bundle: './src/scripts/app.js',
  },
  output: {
    path: __dirname + '/app/scripts',
    filename: 'bundle.js',
		publicPath: '/app/',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
},{
  entry: {
    style: './src/scss/app.scss'
  },
  output: {
    path: __dirname + '/app/styles',
    filename: 'style.css'
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize!sass-loader")
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}]
