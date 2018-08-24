import webpack from 'webpack';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import updateWebpackConfig from '../config/updateWebpackConfig';
import context from './common/context';
import generateEntryFile from './common/generateEntryFile';
import getPackagePath from './common/getPackagePath';
import installSubmoduleDependencies from './common/installSubmoduleDependencies';
import initialize from './common/initialize';
import warning from '../common/warning';

function dist(mainPackage, env) {
  const { choerodonConfig: { entryName } } = context;
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
  const { choerodonConfig: { output } } = context;
  const env = program.env || process.env.NODE_ENV || 'production';
  rimraf.sync(output);
  mkdirp.sync(output);
  if (program.args.length) {
    installSubmoduleDependencies(program, mainPackage => dist(mainPackage, env));
  } else {
    const mainPackagePath = getPackagePath();
    const mainPackage = require(mainPackagePath);
    dist(mainPackage, env);
  }
}
