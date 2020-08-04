/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import fs from 'fs';
import { join } from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import context from '../bin/common/context';
import getStyleLoadersConfig from './getStyleLoadersConfig';
import getEnterPointsConfig from './getEnterPointsConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';
import getDefaultTheme from './getDefaultTheme';
import getPackagePath from '../bin/common/getPackagePath';
import getProjectType from '../bin/common/getProjectType';

const choerodonLib = join(__dirname, '..');

function getFilePath(file) {
  const { isDev } = context;
  const filePath = join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    return filePath;
  } if (isDev) {
    return join(process.cwd(), 'src', file);
  }
  return join(__dirname, '..', file);
}

export default function updateWebpackConfig(mode, env) {
  const pkgPath = getPackagePath();
  const pkg = require(pkgPath);
  const { isChoerodon, projectType } = getProjectType();
  const webpackConfig = getWebpackCommonConfig(mode, env);
  const { choerodonConfig } = context;
  const {
    theme, output, root, enterPoints, server, webSocketServer, local,
    postcssConfig, entryName, titlename, htmlTemplate, favicon, menuTheme,
    emailBlackList, clientid, dashboard, resourcesLevel, apimGateway,
    uiConfigure, outward, customThemeColor,
  } = choerodonConfig;
  const styleLoadersConfig = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    modifyVars: { ...getDefaultTheme(env), ...theme },
  });
  const styleLoadersConfigWithCssLoader = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    modifyVars: { ...getDefaultTheme(env), ...theme },
  }, true);
  let defaultEnterPoints;
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
    defaultEnterPoints = {
      API_HOST: server,
      AUTH_HOST: isChoerodon ? `${server}/oauth` : server,
      CLIENT_ID: clientid,
      LOCAL: local,
      VERSION: '本地',
      TITLE_NAME: titlename,
      WEBSOCKET_SERVER: webSocketServer,
      APIM_GATEWAY: apimGateway,
      EMAIL_BLACK_LIST: emailBlackList,
      CUSTOM_THEME_COLOR: customThemeColor,
    };
  } else if (mode === 'build') {
    webpackConfig.output.publicPath = root;
    webpackConfig.output.path = join(process.cwd(), 'src', 'main', 'resources', 'lib', output);
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
    if (isChoerodon) {
      defaultEnterPoints = getEnterPointsConfig();
    } else {
      defaultEnterPoints = {
        API_HOST: server,
        AUTH_HOST: server,
        LOCAL: local,
        VERSION: '本地',
        TITLE_NAME: titlename,
        WEBSOCKET_SERVER: '',
      };
    }
  }
  /* eslint-enable no-param-reassign */
  const mergedEnterPoints = {
    NODE_ENV: env,
    MENU_THEME: menuTheme,
    UI_CONFIGURE: JSON.stringify(uiConfigure || {}),
    USE_DASHBOARD: !!dashboard,
    SERVICES_CONFIG: JSON.stringify(pkg.servicesConfig || []),
    RESOURCES_LEVEL: Array.isArray(resourcesLevel) ? resourcesLevel.join(',') : resourcesLevel,
    TYPE: projectType,
    OUTWARD: outward,
    ...defaultEnterPoints,
    ...enterPoints(mode, env),
  };
  const defines = Object.keys(mergedEnterPoints).reduce((obj, key) => {
    // eslint-disable-next-line no-param-reassign
    obj[`process.env.${key}`] = JSON.stringify(process.env[key] || mergedEnterPoints[key]);
    return obj;
  }, {});
  const customizedWebpackConfig = choerodonConfig.webpackConfig(webpackConfig, webpack);

  if (customizedWebpackConfig.entry[entryName]) {
    throw new Error(`Should not set \`webpackConfig.entry.${entryName}\`!`);
  }
  const entryPath = join(choerodonLib, '..', 'tmp', `entry.${entryName}.js`);
  customizedWebpackConfig.entry[entryName] = entryPath;
  if (!isChoerodon) {
    const entryWithoutSiderPath = join(choerodonLib, '..', 'tmp', 'entry.withoutsider.js');
    customizedWebpackConfig.entry.withoutsider = entryWithoutSiderPath;
  }
  customizedWebpackConfig.plugins.push(
    new webpack.DefinePlugin(defines),
    new HtmlWebpackPlugin({
      title: process.env.TITLE_NAME || titlename,
      template: getFilePath(htmlTemplate),
      // fileName: 'index.html',
      inject: true,
      chunks: ['vendor', entryName],
      favicon: getFilePath(favicon),
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
  if (!isChoerodon) {
    customizedWebpackConfig.plugins.push(
      new HtmlWebpackPlugin({
        title: process.env.TITLE_NAME || titlename,
        template: getFilePath(htmlTemplate),
        chunks: ['vendor', 'withoutsider'],
        filename: 'withoutsider.html',
        inject: true,
        favicon: getFilePath(favicon),
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
  }
  return customizedWebpackConfig;
}
