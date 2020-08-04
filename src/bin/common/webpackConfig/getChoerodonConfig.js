import fs from 'fs';
import autoprefixer from 'autoprefixer';
import path from 'path';

const defaultConfig = {
  port: 9090,
  entry: path.resolve(process.cwd(), './node_modules/@choerodon/master/lib/entry.js'),
  output: './dist',
  htmlTemplate: 'index.template.html',
  devServerConfig: {},
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
  routes: null,
  local: true,
  server: '',
  clientid: 'localhost',
  webSocketServer: 'http://localhost:8080',
  titlename: 'Choerodon | 多云应用技术集成平台',
  favicon: 'favicon.ico',
  dashboard: false,
  guide: false,
  proxyTarget: 'http://localhost:8080',
  distBasePath: './src/main/resources/lib',
  htmlPath: './src/main/resources/WEB-INF/view',
  homePath: undefined,
  menuTheme: 'light',
  resourcesLevel: ['site', 'user'],
};

export default function getChoerodonConfig(configFile) {
  const customizedConfig = fs.existsSync(configFile) ? require(configFile) : {};
  return { ...defaultConfig, ...customizedConfig };
}
