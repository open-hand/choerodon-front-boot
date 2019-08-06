import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import openBrowser from 'react-dev-utils/openBrowser';
import context from './common/context';
import initialize from './common/initialize';
import getProjectType from './common/getProjectType';
import getPackagePath from './common/getPackagePath';
import generateEntryFile from './common/generateEntryFile';
import updateWebpackConfig from '../config/updateWebpackConfig';
import installSubmoduleDependencies from './common/installSubmoduleDependenciesAndServicesConfig';
import generateEnv from './common/generateEnv';

/**
 * generateEntryFile and start webpack-dev-server
 * @param {*} mainPackage workspace pkg.json object
 * @param {*} dev 
 */
function run(mainPackage, dev) {
  const { choerodonConfig: { entryName, devServerConfig, output, port, proxyTarget } } = context;
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
    contentBase: [path.join(process.cwd(), 'src', 'main', 'resources', 'lib', output), path.join(__dirname, '../../')],
    historyApiFallback: true,
    host: 'localhost',
  };
  const { isChoerodon } = getProjectType();
  if (!isChoerodon) {
    serverOptions.proxy = [{
      context: ['**', '!/', '!/dis/**'],
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
      autoRewrite: true,
    }];
  }
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
  if (Array.isArray(modules) && modules.length > 0) {
    const { isChoerodon } = getProjectType();
    generateEnv(() => installSubmoduleDependencies(run, isChoerodon), true);
  } else {
    const mainPackagePath = getPackagePath();
    const mainPackage = require(mainPackagePath);
    generateEnv(() => run(mainPackage), true);
  }
}
