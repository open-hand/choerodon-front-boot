import { join } from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import chalk from 'chalk';
import getBabelCommonConfig from './getBabelCommonConfig';
import getTSCommonConfig from './getTSCommonConfig';
import context from '../bin/common/context';

const jsFileName = '[name].[hash:8].js';
const jsChunkFileName = 'chunks/[name].[chunkhash:5].chunk.js';
const cssFileName = '[name].[contenthash:8].css';
const assetFileName = 'assets/[name].[hash:8].[ext]';

function getAssetLoader(mimetype, limit = 10000) {
  return {
    loader: 'url-loader',
    options: {
      limit,
      mimetype,
      name: assetFileName,
    },
  };
}

export default function getWebpackCommonConfig(mode, env) {
  const { isDev } = context;
  const babelOptions = getBabelCommonConfig(mode, env);
  const tsOptions = getTSCommonConfig();

  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
    }),
    new ExtractTextPlugin({
      filename: cssFileName,
      disable: false,
      allChunks: true,
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.ProgressPlugin((percentage, msg, addInfo) => {
      const stream = process.stderr;
      if (stream.isTTY && percentage < 0.71) {
        stream.cursorTo(0);
        stream.write(`📦  ${chalk.magenta(msg)} (${chalk.magenta(addInfo)})`);
        stream.clearLine(1);
      } else if (percentage === 1) {
        /* eslint-disable */
        console.log(chalk.green('\nwebpack: bundle build is now finished.'));
        /* eslint-enable */
      }
    }),
    new FriendlyErrorsWebpackPlugin(),
    new webpack.ProvidePlugin({
      Choerodon: isDev ? join(process.cwd(), 'src/containers/common') : join(__dirname, '../containers/common'),
    }),
  ];

  if (env === 'production') {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            ascii_only: true,
          },
        },
      }),
    );
  }
  return {
    output: {
      filename: jsFileName,
      chunkFilename: jsChunkFileName,
    },
    resolve: {
      modules: ['node_modules', join(__dirname, '../../node_modules')],
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    resolveLoader: {
      modules: ['node_modules', join(__dirname, '../../node_modules')],
    },

    module: {
      noParse: [/moment.js/],
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: babelOptions,
        },
        {
          test: /\.jsx$/,
          loader: 'babel-loader',
          options: babelOptions,
        },
        {
          test: /\.tsx?$/,
          use: [{
            loader: 'babel-loader',
            options: babelOptions,
          }, {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: tsOptions,
            },
          }],
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader('application/font-woff'),
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader('application/font-woff'),
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader('application/octet-stream'),
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader('application/vnd.ms-fontobject'),
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader('image/svg+xml'),
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          use: getAssetLoader(),
        },
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
      ],
    },
    plugins,
  };
}
