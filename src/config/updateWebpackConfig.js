import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import context from '../context';
import getStyleLoadersConfig from './getStyleLoadersConfig';
import getEntryPointsConfig from './getEntryPointsConfig';

const choerodonLib = path.join(__dirname, '..');

function getFilePath(favicon) {
  const faviconPath = path.join(process.cwd(), favicon);
  return fs.existsSync(faviconPath) ? faviconPath : path.join(__dirname, '..', favicon);
}

export default function updateWebpackConfig(webpackConfig, mode) {
  const { choerodonConfig } = context;
  const styleLoadersConfig = getStyleLoadersConfig(choerodonConfig.postcssConfig, {
    sourceMap: true,
    modifyVars: choerodonConfig.theme,
  });
  let env;

  /* eslint-disable no-param-reassign */
  webpackConfig.entry = {};
  if (context.isBuild) {
    webpackConfig.output.path = path.join(process.cwd(), choerodonConfig.output);
  }
  webpackConfig.output.publicPath = context.isBuild ? choerodonConfig.root : '/';
  if (mode === 'start') {
    webpackConfig.devtool = 'cheap-module-eval-source-map';
    webpackConfig.watch = true;
    styleLoadersConfig.forEach((config) => {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ['style-loader', ...config.use],
      });
    });
    env = {
      'process.env.API_HOST': JSON.stringify(`${choerodonConfig.server}`),
      'process.env.AUTH_HOST': JSON.stringify(`${choerodonConfig.server}/oauth`),
      'process.env.CLIENT_ID': JSON.stringify(`${choerodonConfig.clientid}`),
      'process.env.LOCAL': JSON.stringify(`${choerodonConfig.local}`),
      'process.env.VERSION': JSON.stringify('本地'),
    };
  }
  if (mode === 'build') {
    styleLoadersConfig.forEach((config) => {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ExtractTextPlugin.extract({
          use: config.use,
        }),
      });
    });
    env = {
      'process.env.API_HOST': getEntryPointsConfig('API_HOST'),
      'process.env.AUTH_HOST': getEntryPointsConfig('AUTH_HOST'),
      'process.env.CLIENT_ID': getEntryPointsConfig('CLIENT_ID'),
      'process.env.LOCAL': getEntryPointsConfig('LOCAL'),
      'process.env.HEADER_TITLE_NAME': getEntryPointsConfig('HEADER_TITLE_NAME'),
      'process.env.COOKIE_SERVER': getEntryPointsConfig('COOKIE_SERVER'),
      'process.env.VERSION': getEntryPointsConfig('VERSION'),
      'process.env.TITLE_NAME': getEntryPointsConfig('TITLE_NAME'),
    };
  }
  /* eslint-enable no-param-reassign */

  const customizedWebpackConfig = choerodonConfig.webpackConfig(webpackConfig, webpack);

  if (customizedWebpackConfig.entry[choerodonConfig.entryName]) {
    throw new Error(`Should not set \`webpackConfig.entry.${choerodonConfig.entryName}\`!`);
  }
  const entryPath = path.join(choerodonLib, '..', 'tmp', `entry.${choerodonConfig.entryName}.js`);
  customizedWebpackConfig.entry[choerodonConfig.entryName] = entryPath;
  customizedWebpackConfig.plugins.push(
    new webpack.DefinePlugin(env),
    new HtmlWebpackPlugin({
      title: process.env.TITLE_NAME || choerodonConfig.titlename,
      template: getFilePath(choerodonConfig.htmlTemplate),
      inject: true,
      favicon: getFilePath(choerodonConfig.favicon),
      minify: {
        html5: true,
        collapseWhitespace: true,
        removeComments: true,
        removeTagWhitespace: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
      },
    }),
  );
  return customizedWebpackConfig;
}
