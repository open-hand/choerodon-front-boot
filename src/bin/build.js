import webpack from 'webpack';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import updateWebpackConfig from '../config/updateWebpackConfig';
import context from './common/context';
import generateEntryFile from './common/generateEntryFile';
import getPackagePath from './common/getPackagePath';
import installSubmoduleDependencies from './common/installSubmoduleDependencies';
import initialize from './common/initialize';

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
      return console.error(err);
    }

    if (stats.hasErrors()) {
      console.log(stats.toString('errors-only'));
      return;
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
