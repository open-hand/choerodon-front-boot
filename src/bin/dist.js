import webpack from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import context from './common/context';
import warning from '../common/warning';
import initialize from './common/initialize';
import getPackagePath from './common/getPackagePath';
import generateEntryFile from './common/generateEntryFile';
import updateWebpackConfig from '../config/updateWebpackConfig';
import installSubmoduleDependencies from './common/installSubmoduleDependenciesAndServicesConfig';
import generateEnv from './common/generateEnv';

function copy(fileName) {
  const { choerodonConfig: { output, distBasePath, htmlPath } } = context;

  const originPath = path.join(__dirname, '../../', fileName);
  const distPath = path.join(process.cwd(), distBasePath, output, fileName);
  fs.copyFileSync(originPath, distPath);
}

function handleAfterCompile() {
  const COPY_FILE_NAME = ['.env', '.default.env', 'env.sh', 'env-config.js'];
  COPY_FILE_NAME.forEach(filename => copy(filename));
}

function dist(mainPackage, env) {
  const { choerodonConfig: { entryName, output, distBasePath } } = context;
  const distPath = path.join(process.cwd(), distBasePath, output);
  rimraf.sync(distPath);
  mkdirp.sync(distPath);

  generateEntryFile(
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
  if (Array.isArray(modules) && modules.length > 0) {
    generateEnv(() => installSubmoduleDependencies(mainPackage => dist(mainPackage, env)));
    // installSubmoduleDependencies(mainPackage => dist(mainPackage, env));
  } else {
    const mainPackagePath = getPackagePath();
    const mainPackage = require(mainPackagePath);
    // dist(mainPackage, env);
    generateEnv(() => dist(mainPackage, env));
  }
}
