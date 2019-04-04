import fs from 'fs';
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
  server: 'http://api.example.com',
  fileServer: 'http://file.example.com',
  webSocketServer: 'ws://ws.example.com',
  apimGateway: 'http://apim.example.com',
  clientid: 'localhost',
  titlename: 'Choerodon | 企业级数字服务平台',
  favicon: 'favicon.ico',
  dashboard: false,
  guide: false,
};

export default function getChoerodonConfig(configFile) {
  const customizedConfig = fs.existsSync(configFile) ? require(configFile) : {};
  return Object.assign({}, defaultConfig, customizedConfig);
}
