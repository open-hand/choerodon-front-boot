import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import openBrowser from 'react-dev-utils/openBrowser';
import updateWebpackConfig from '../config/updateWebpackConfig';
import context from './common/context';
import generateEntryFile from './common/generateEntryFile';
import getPackagePath from './common/getPackagePath';
import initialize from './common/initialize';
import installSubmoduleDependencies from './common/installSubmoduleDependencies';

function run(mainPackage) {
  const { choerodonConfig } = context;
  generateEntryFile(
    mainPackage,
    choerodonConfig.entryName,
  );

  const webpackConfig = updateWebpackConfig('start', 'development');
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  const serverOptions = {
    quiet: true,
    hot: true,
    ...choerodonConfig.devServerConfig,
    contentBase: path.join(process.cwd(), choerodonConfig.output),
    historyApiFallback: true,
    host: 'localhost',
  };
  WebpackDevServer.addDevServerEntrypoints(webpackConfig, serverOptions);

  const compiler = webpack(webpackConfig);

  const timefix = 11000;
  compiler.plugin('watch-run', (watching, callback) => {
    watching.startTime += timefix;
    callback();
  });
  compiler.plugin('done', (stats) => {
    stats.startTime -= timefix;
  });

  const server = new WebpackDevServer(compiler, serverOptions);
  server.listen(
    choerodonConfig.port, '0.0.0.0',
    () => openBrowser(`http://localhost:${choerodonConfig.port}`),
  );
}

export default function start(program) {
  initialize(program);
  if (program.args.length) {
    installSubmoduleDependencies(program, run);
  } else {
    const mainPackagePath = getPackagePath();
    const mainPackage = require(mainPackagePath);
    run(mainPackage);
  }
};
