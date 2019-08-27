import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import openBrowser from 'react-dev-utils/openBrowser';
import context from './common/context';
import initialize from './common/initialize';
import getPackagePath from './common/utils/getPackagePath';
import handleGenerateEntry from './common/handleGenerateEntry';
import updateWebpackConfig from '../config/updateWebpackConfig';
import handleCollectRoute from './common/handleCollectRoute';
import handleEnvironmentVariable from './common/handleEnvironmentVariable';

function run(mainPackage, dev) {
  const { choerodonConfig: { entryName, devServerConfig, output, port } } = context;
  handleGenerateEntry(
    mainPackage,
    entryName,
  );

  const webpackConfig = updateWebpackConfig('start', 'development');
  const serverOptions = {
    quiet: true,
    hot: true,
    ...devServerConfig,
    contentBase: [path.join(__dirname, '../../')],
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
    port, '0.0.0.0',
    () => openBrowser(`http://localhost:${port}`),
  );
}

export default function start(program, dev) {
  initialize(program, dev);
  const { choerodonConfig: { modules } } = context;
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);
  handleEnvironmentVariable(true);
  if (Array.isArray(modules) && modules.length > 0) {
    handleCollectRoute(mainPackage);
  }
  run(mainPackage);
}
