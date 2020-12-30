/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import fs from 'fs';
import autoprefixer from 'autoprefixer';
import path from 'path';

const defaultConfig = {
  port: 9090,
  entry: path.resolve(process.cwd(), './node_modules/@choerodon/master/lib/entry.js'),
  output: './dist',
  postcssConfig: {
    plugins: [
      autoprefixer({
        browsers: [
          'last 2 versions',
          'Firefox ESR',
          '> 1%',
          'ie >= 8',
          'iOS >= 8',
          'Android >= 4',
        ],
      }),
    ],
  },
  babelConfig(config, mode, env) {
    return config;
  },
  webpackConfig(config, mode, env) {
    return config;
  },
  enterPoints(mode, env) {
    return {};
  },
  entryName: 'index',
  root: '/',
  webSocketServer: 'http://localhost:8080',
  titlename: 'Choerodon | 多云应用技术集成平台',
  favicon: 'favicon.ico',
  distBasePath: './src/main/resources/lib',
};

export default function getChoerodonConfig(configFile) {
  const customizedConfig = fs.existsSync(configFile) ? require(configFile) : {};
  return { ...defaultConfig, ...customizedConfig };
}
