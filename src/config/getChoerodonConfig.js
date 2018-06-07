import * as fs from 'fs';
import * as path from 'path';
import * as resolve from 'resolve';
import autoprefixer from 'autoprefixer';

const defaultConfig = {
  port: 9090,
  output: './dist',
  htmlTemplate: 'index.template.html',
  devServerConfig: {},
  postcssConfig: {
    plugins: [
      autoprefixer({
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
      }),
    ],
  },
  babelConfig(config) {
    return config;
  },
  webpackConfig(config) {
    return config;
  },
  entryName: 'index',
  root: '/',
  routes: null,
  local: true,
  server: 'http://api.example.com',
  clientid: 'localhost',
  titlename: 'Choerodon',
  favicon: 'favicon.ico',
  theme: {
    'primary-color': '#3F51B5',
  },
};

module.exports = function getChoerodonConfig(configFile) {
  const customizedConfig = fs.existsSync(configFile) ? require(configFile) : {};
  const config = Object.assign({}, defaultConfig, customizedConfig);
  // config.index = resolve.sync(config.index, { basedir: process.cwd() });
  return config;
};
