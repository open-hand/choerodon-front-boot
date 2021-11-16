import webpack from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import context from '../utils/context';
import warning from '../utils/warning';
import handleCollectRoute from '../utils/handleCollectRoute';
import handleCollectModules from '../utils/handleCollectModules';
import getEnv from '../utils/getEnv';
import configFactory from '../config/webpack.config';

const paths = require('../config/paths');

function copy(fileName) {
  const { choerodonConfig: { output, distBasePath } } = context;

  const originPath = path.join(paths.ownRoot, fileName);
  const distPath = path.join(process.cwd(), distBasePath, output, fileName);
  fs.copyFileSync(originPath, distPath);
}
/**
 * 由于部署的时候执行env.sh进行环境变量替换
 * 所以这里需要指定哪些环境变量需要替换，也就是dist文件夹下的.env文件中的变量
 * 这里打包完之后，把用户的.env(一般是总前端)复制到dist文件夹下
 */
function handleAfterCompile() {
  const { choerodonConfig: { output, distBasePath } } = context;
  if (fs.existsSync(paths.dotenv)) {
    fs.copyFileSync(paths.dotenv, path.join(process.cwd(), distBasePath, output, '.env'));
  }
  const COPY_FILE_NAME = ['env.sh', 'env-config.js'];
  COPY_FILE_NAME.forEach((filename) => copy(filename));
  const originPath = path.join(process.cwd(), output);
  const distPath = path.join(process.cwd(), distBasePath, output);
  fs.copySync(`${originPath}`, distPath);
}

export default function build(program) {
  const env = program.env || process.env.NODE_ENV || 'production';
  const shouldUseEsbuild = program.esbuild;
  // 初始化全局参数context
  const { initContext } = context;
  initContext(program, false);

  const {
    choerodonConfig: {
      entryName, output, distBasePath,
    },
  } = context;

  const distPath = path.join(process.cwd(), distBasePath, output);
  rimraf.sync(distPath);
  mkdirp.sync(distPath);
  // 收集路由，单模块启动也得配置路径
  handleCollectRoute(entryName);
  handleCollectModules(entryName);

  const webpackConfig = configFactory('build', env, getEnv());

  if (shouldUseEsbuild) {
    const EsbuildPlugin = require('esbuild-webpack-plugin').default;
    console.log('use esbuild as webpack minimizer');
    webpackConfig.optimization.minimizer = [new EsbuildPlugin({ target: 'es2015' })];
  }
  webpack(webpackConfig, (err, stats) => {
    if (err !== null) {
      warning(false, err);
      process.exit(1);
    } else if (stats.hasErrors()) {
      warning(false, stats.toString('errors-only'));
      process.exit(1);
    }
    handleAfterCompile();
  });
}
