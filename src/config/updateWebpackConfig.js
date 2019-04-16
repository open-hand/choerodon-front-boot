import fs from 'fs';
import { join } from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import context from '../bin/common/context';
import getStyleLoadersConfig from './getStyleLoadersConfig';
import getEnterPointsConfig from './getEnterPointsConfig';
import getWebpackCommonConfig from './getWebpackCommonConfig';
import getDefaultTheme from './getDefaultTheme';

const choerodonLib = join(__dirname, '..');

function getFilePath(file) {
  const { isDev } = context;
  const filePath = join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    return filePath;
  } else if (isDev) {
    return join(process.cwd(), 'src', file);
  } else {
    return join(__dirname, '..', file);
  }
}

export default function updateWebpackConfig(mode, env) {
  const webpackConfig = getWebpackCommonConfig(mode, env);
  const { choerodonConfig } = context;
  const {
    theme, output, root, enterPoints, server, fileServer, webSocketServer, clientid, local,
    postcssConfig, entryName, titlename, htmlTemplate, favicon, dashboard, guide, apimGateway,
  } = choerodonConfig;
  const styleLoadersConfig = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    modifyVars: Object.assign({}, getDefaultTheme(), theme),
    javascriptEnabled: true,
  });

  let defaultEnterPoints;
  webpackConfig.entry = {};
  if (mode === 'start') {
    webpackConfig.output.publicPath = '/';
    webpackConfig.devtool = 'cheap-module-eval-source-map';
    webpackConfig.watch = true;
    styleLoadersConfig.forEach((config) => {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ['style-loader', ...config.use],
      });
    });
    defaultEnterPoints = {
      API_HOST: server,
      AUTH_HOST: `${server}/oauth`,
      CLIENT_ID: clientid,
      LOCAL: local,
      VERSION: '本地',
      FILE_SERVER: fileServer,
      WEBSOCKET_SERVER: webSocketServer,
      APIM_GATEWAY: apimGateway,
    };
  } else if (mode === 'build') {
    webpackConfig.output.publicPath = root;
    webpackConfig.output.path = join(process.cwd(), output);
    styleLoadersConfig.forEach((config) => {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ExtractTextPlugin.extract({
          use: config.use,
        }),
      });
    });
    defaultEnterPoints = getEnterPointsConfig();
  }
  /* eslint-enable no-param-reassign */
  const mergedEnterPoints = {
    NODE_ENV: env,
    USE_DASHBOARD: !!dashboard,
    USE_GUIDE: !!guide,
    ...defaultEnterPoints,
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
  customizedWebpackConfig.entry[entryName] = entryPath;
  customizedWebpackConfig.plugins.push(
    new webpack.DefinePlugin(defines),
    new HtmlWebpackPlugin({
      title: process.env.TITLE_NAME || titlename,
      template: getFilePath(htmlTemplate),
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
  return customizedWebpackConfig;
}
