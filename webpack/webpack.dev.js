/*
  editor: smilesoul 2018/2/8
*/

const DashboardPlugin = require('webpack-dashboard/plugin');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackConfig = require('./webpack.config');

process.env.NODE_ENV = 'development';
const env = require('./comonConfig/webpack.env');


module.exports = merge(webpackConfig, {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:9090',
    'webpack/hot/only-dev-server',
    "./src/index"
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app/[name]_[hash:8].js',
    chunkFilename: 'app/chunks/[name].[chunkhash:5].chunk.js',
  },
  watch: true,
  plugins: [
    new webpack.DefinePlugin(env),
    new DashboardPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    //new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
});
