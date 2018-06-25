import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import context from '../context';
import getStyleLoadersConfig from './getStyleLoadersConfig';
import getEnterPointsConfig from './getEnterPointsConfig';

const choerodonLib = path.join(__dirname, '..');

function getFilePath(file) {
  const filePath = path.join(process.cwd(), file);
  return fs.existsSync(filePath) ? filePath : path.join(__dirname, '..', file);
}

export default function updateWebpackConfig(webpackConfig, mode) {
  const { choerodonConfig, isBuild } = context;
  const {
    theme, output, root, enterPoints, server, fileServer, clientid, local,
    postcssConfig, entryName, titlename, htmlTemplate, favicon,
  } = choerodonConfig;
  const styleLoadersConfig = getStyleLoadersConfig(postcssConfig, {
    sourceMap: true,
    modifyVars: theme,
  });

  let defaultEnterPoints;
  /* eslint-disable no-param-reassign */
  webpackConfig.entry = {};
  if (isBuild) {
    webpackConfig.output.path = path.join(process.cwd(), output);
  }
  webpackConfig.output.publicPath = isBuild ? root : '/';
  if (mode === 'start') {
    webpackConfig.devtool = 'cheap-module-eval-source-map';
    webpackConfig.watch = true;
    styleLoadersConfig.forEach((config) => {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ['style-loader', ...config.use],
      });
    });
    defaultEnterPoints = {
      NODE_ENV: 'development',
      API_HOST: server,
      AUTH_HOST: `${server}/oauth`,
      CLIENT_ID: clientid,
      LOCAL: local,
      VERSION: '本地',
      FILE_SERVER: fileServer,
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
    defaultEnterPoints = {
      NODE_ENV: 'production',
      ...getEnterPointsConfig(),
    };
  }
  /* eslint-enable no-param-reassign */
  const mergedEnterPoints = Object.assign(defaultEnterPoints, enterPoints(mode));
  const env = Object.keys(mergedEnterPoints).reduce((obj, key) => {
    obj[`process.env.${key}`] = JSON.stringify(process.env[key] || mergedEnterPoints[key]);
    return obj;
  }, {});
  const customizedWebpackConfig = choerodonConfig.webpackConfig(webpackConfig, webpack);

  if (customizedWebpackConfig.entry[entryName]) {
    throw new Error(`Should not set \`webpackConfig.entry.${entryName}\`!`);
  }
  const entryPath = path.join(choerodonLib, '..', 'tmp', `entry.${entryName}.js`);
  customizedWebpackConfig.entry[entryName] = entryPath;
  customizedWebpackConfig.plugins.push(
    new webpack.DefinePlugin(env),
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
