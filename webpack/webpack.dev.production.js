/*
  editor: smilesoul 2018/2/8
*/

const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackProConfig = require('./webpack.config');

process.env.NODE_ENV = 'production';
const env = require('./comonConfig/webpack.env');

module.exports = merge(webpackProConfig, {
  entry: [
    'babel-polyfill',
    './src/containers/common/Choerodon',
    "./src/index.prod"
  ],
  plugins: [
    new webpack.DefinePlugin(env),
  ],
});
