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
  });
}

export default function build(program) {
  initialize(program);
  const env = program.env || process.env.NODE_ENV || 'production';
  const { choerodonConfig: { modules } } = context;
  if (Array.isArray(modules) && modules.length > 0) {
    installSubmoduleDependencies(mainPackage => dist(mainPackage, env));
  } else {
    const mainPackagePath = getPackagePath();
    const mainPackage = require(mainPackagePath);
    dist(mainPackage, env);
  }
}
