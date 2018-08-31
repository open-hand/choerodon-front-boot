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

function run(mainPackage, dev) {
  const { choerodonConfig: { entryName, devServerConfig, output, port } } = context;
  generateEntryFile(
    mainPackage,
    entryName,
    dev,
  );

  const webpackConfig = updateWebpackConfig('start', 'development');
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  const serverOptions = {
    quiet: true,
    hot: true,
    ...devServerConfig,
    contentBase: path.join(process.cwd(), output),
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
  if (!dev && program.args.length) {
    installSubmoduleDependencies(program, run);
  } else {
    const mainPackagePath = getPackagePath();
    const mainPackage = require(mainPackagePath);
    run(mainPackage);
  }
}
