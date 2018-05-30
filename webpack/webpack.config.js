/*
  editor: smilesoul 2018/2/8
*/

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const config = require('./comonConfig/webpack.file');
const pathAlias = require('./comonConfig/webpack.alias');
const ruleLoader = require('./comonConfig/webpack.rule');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const styleLintPlugin = require('stylelint-webpack-plugin');
// 处理 BashOnWindow 下的打包错误

try {
  require('os').networkInterfaces();
} catch (e) {
  require('os').networkInterfaces = () => ({});
}

const originWebpackConfig = {
  entry: {
    vendor: ['react', 'react-dom', 'react-router-dom'],
    app: ['react-hot-loader/patch', path.resolve(__dirname, '../src/index.js')],
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'app/[name]_[hash:8].js',
    chunkFilename: 'app/chunks/[name].[chunkhash:5].chunk.js',
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, '../src'),
      path.resolve(__dirname, '../node_modules'),
      'node_modules',
      ...config.pathModule,
    ],
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx', '.less', 'css', 'scss'],
    alias: pathAlias,
  },
  module: {
    loaders: [
      {
        loader: path.resolve(__dirname, '../node_modules/happypack/loader.js'),
      },
    ],
    rules: ruleLoader.rules,
  },
  plugins: [
    ...ruleLoader.happypackLoader,
    new styleLintPlugin({
      configFile: '.stylelintrc.json',
      files: ['./src/app/*/assets/*.[ls]?(e|c)ss',
        './src/app/*/components/*/*.[ls]?(e|c)ss',
        './src/app/*/containers/*/*/*/*.[ls]?(e|c)ss',
        './src/app/*/containers/*/*/*/*/*.[ls]?(e|c)ss',
        './src/app/*/containers/*/*/*/components/*.[ls]?(e|c)ss'],
      failOnError: false,
      quiet: false,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
    }),
    new HardSourceWebpackPlugin({
      cacheDirectory: path.resolve('.cache', 'hard-source/[confighash]'),
      recordsPath: path.resolve('.cache', 'hard-source/[confighash]/records.json'),
      environmentHash: {
        root: process.cwd(),
        directories: ['node_modules'],
        files: ['package.json'],
      },
      environmentHash: function () {
        return new Promise(function (resolve, reject) {
          require('fs').readFile(path.resolve(__dirname, '../package.json'), function (err, src) {
            if (err) {
              return reject(err);
            }
            resolve(require('crypto').createHash('md5').update(src).digest('hex'));
          });
        });
      },
    }),
    new HtmlWebpackPlugin({
      title: process.env.TITLE_NAME || config.titlename,
      template: path.resolve(__dirname, '../src/index.template.html'),
      inject: true,
      favicon: path.resolve(__dirname, `../../${config.favicon}`),
      minify: {
        html5: true,
        collapseWhitespace: true,
        removeComments: true,
        removeTagWhitespace: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
      },
    }),
  ],
};
const webpackHook = config.webpackHook;
let comboWebpackConfig;
if (typeof webpackHook === 'function') {
  comboWebpackConfig = webpackHook(originWebpackConfig);
}

module.exports = comboWebpackConfig || originWebpackConfig;
