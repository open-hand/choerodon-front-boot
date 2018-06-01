const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackProConfig = require('./webpack.config');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

process.env.NODE_ENV = 'production';
const env = require('./comonConfig/webpack.env');

module.exports = merge(webpackProConfig, {
  entry: [
    'babel-polyfill',
    './src/containers/common/Choerodon',
    './src/index.prod',
  ],
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   sourceMap: true,
    //   output: {
    //     comments: false,  // remove all comments
    //   },
    //   compress: {
    //     warnings: true,
    //   }
    // }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: ['module', 'exports', 'require']
      },
      sourceMap: true,
      parallel: {
        cache: true,
        workers: 2
      },
      output: {
        comments: false,
        beautify: false,
      },
      compress: {
        warnings: true,
      }
    }),
    new webpack.DefinePlugin(env),
  ],
});
