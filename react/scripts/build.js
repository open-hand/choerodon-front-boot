import webpack from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import context from '../utils/context';
import warning from '../utils/warning';
import handleCollectRoute from '../utils/handleCollectRoute';
import generateEnvironmentVariable from '../utils/generateEnvironmentVariable';
import configFactory from '../config/webpack.config';

function copy(fileName) {
  const { choerodonConfig: { output, htmlPath, distBasePath } } = context;

  const originPath = path.join(__dirname, '../../', fileName);
  const distPath = path.join(process.cwd(), distBasePath, output, fileName);
  fs.copyFileSync(originPath, distPath);
}

function handleAfterCompile() {
  const COPY_FILE_NAME = ['.env', '.default.env', 'env.sh', 'env-config.js'];
  COPY_FILE_NAME.forEach((filename) => copy(filename));

  const { choerodonConfig: { output, htmlPath, distBasePath } } = context;

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
      entryName, output, htmlPath, distBasePath,
    },
  } = context;

  const distPath = path.join(process.cwd(), distBasePath, output);
  rimraf.sync(distPath);
  mkdirp.sync(distPath);
  // 收集路由，单模块启动也得配置路径
  handleCollectRoute(entryName);

  const webpackConfig = configFactory('build', env, generateEnvironmentVariable());
  webpackConfig.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
  }));
  if (shouldUseEsbuild) {
    // eslint-disable-next-line global-require
    const EsbuildPlugin = require('esbuild-webpack-plugin').default;
    // eslint-disable-next-line no-console
    console.log('use esbuild as webpack minimizer');
    webpackConfig.optimization.minimizer = [new EsbuildPlugin()];
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
