import fs from 'fs';
import { join } from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import context from './context';
import getStyleLoadersConfig from './webpackConfig/getStyleLoadersConfig';
import getWebpackCommonConfig from './webpackConfig/getWebpackCommonConfig';
import getDefaultTheme from './webpackConfig/getDefaultTheme';
import escapeWinPath from './utils/escapeWinPath';

const choerodonLib = join(__dirname, '..', '..');

function getFilePath(file) {
  const { isDev } = context;
  const filePath = join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    return filePath;
  } else if (isDev) {
    return join(process.cwd(), 'src', file);
  } else {
    return join(__dirname, '../../', file);
  }
}

export default function updateWebpackConfig(mode, env, envStr) {
  const { choerodonConfig } = context;
  const {
    theme, output, root, enterPoints, postcssConfig, entryName,
    titlename, htmlTemplate, favicon, resourcesLevel, outward, entry,
  } = choerodonConfig;

  const webpackConfig = getWebpackCommonConfig(mode, env);
  const styleLoadersConfig = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    modifyVars: { ...getDefaultTheme(env), ...theme },
  });
  const styleLoadersConfigWithCssLoader = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    modifyVars: { ...getDefaultTheme(env), ...theme },
  }, true);
  webpackConfig.entry = {};
  if (mode === 'start') {
    webpackConfig.output.publicPath = '/';
    webpackConfig.devtool = 'cheap-module-eval-source-map';
    webpackConfig.watch = true;
    styleLoadersConfig.forEach((config, index) => {
      webpackConfig.module.rules.push({
        oneOf: [{
          test: config.test,
          resourceQuery: /modules/,
          use: ['style-loader', ...styleLoadersConfigWithCssLoader[index].use],
        }, {
          test: config.test,
          use: ['style-loader', ...config.use],
        }],
      });
    });
  } else if (mode === 'build') {
    webpackConfig.output.publicPath = root;
    webpackConfig.output.path = join(process.cwd(), output);
    styleLoadersConfig.forEach((config, index) => {
      webpackConfig.module.rules.push({
        oneOf: [{
          test: config.test,
          resourceQuery: /modules/,
          use: [MiniCssExtractPlugin.loader, ...styleLoadersConfigWithCssLoader[index].use],
        }, {
          test: config.test,
          use: [MiniCssExtractPlugin.loader, ...config.use],
        }],
      });
    });
  }
  const mergedEnterPoints = {
    NODE_ENV: env,
    RESOURCES_LEVEL: Array.isArray(resourcesLevel) ? resourcesLevel.join(',') : resourcesLevel,
    OUTWARD: outward,
    ...enterPoints(mode, env),
  };
  const defines = Object.keys(mergedEnterPoints).reduce((obj, key) => {
    obj[`process.env.${key}`] = JSON.stringify(process.env[key] || mergedEnterPoints[key]);
    return obj;
  }, {});
  const customizedWebpackConfig = choerodonConfig.webpackConfig(webpackConfig, webpack);

  if (customizedWebpackConfig.entry[entryName]) {
    throw new Error(`Should not set \`webpackConfig.entry.${entryName}\`!`);
  }
  const entryPath = join(choerodonLib, '..', 'tmp', `entry.${entryName}.js`);
  customizedWebpackConfig.entry[entryName] = entry;
  customizedWebpackConfig.plugins.push(
    new webpack.DefinePlugin(defines),
    new HtmlWebpackPlugin({
      title: process.env.TITLE_NAME || titlename,
      template: getFilePath(htmlTemplate),
      inject: true,
      // chunks: ['vendor', entryName],
      favicon: getFilePath(favicon),
      env: envStr,
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
