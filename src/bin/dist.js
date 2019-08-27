import webpack from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import context from './common/context';
import warning from './common/utils/warning';
import initialize from './common/initialize';
import getPackagePath from './common/utils/getPackagePath';
import handleGenerateEntry from './common/handleGenerateEntry';
import updateWebpackConfig from '../config/updateWebpackConfig';
import handleCollectRoute from './common/handleCollectRoute';
import handleEnvironmentVariable from './common/handleEnvironmentVariable';

function copy(fileName) {
  const { choerodonConfig: { output, htmlPath } } = context;

  const originPath = path.join(__dirname, '../../', fileName);
  const distPath = path.join(process.cwd(), output, fileName);
  fs.copyFileSync(originPath, distPath);
}

function handleAfterCompile() {
  const COPY_FILE_NAME = ['.env', '.default.env', 'env.sh', 'env-config.js'];
  COPY_FILE_NAME.forEach(filename => copy(filename));
}

function dist(mainPackage, env) {
  const { choerodonConfig: { entryName, output } } = context;
  const distPath = path.join(process.cwd(), output);
  rimraf.sync(distPath);
  mkdirp.sync(distPath);

  handleGenerateEntry(
    mainPackage,
    entryName,
  );
  
  const webpackConfig = updateWebpackConfig('build', env);
  webpackConfig.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
  }));

  webpack(webpackConfig, (err, stats) => {
    if (err !== null) {
      warning(false, err);
    } else if (stats.hasErrors()) {
      warning(false, stats.toString('errors-only'));
    }
    handleAfterCompile();
  });
}

export default function build(program) {
  initialize(program);
  const env = program.env || process.env.NODE_ENV || 'production';
  const { choerodonConfig: { modules } } = context;
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);
  handleEnvironmentVariable();
  if (Array.isArray(modules) && modules.length > 0) {
    handleCollectRoute(mainPackage);
  }
  dist(mainPackage);
}
