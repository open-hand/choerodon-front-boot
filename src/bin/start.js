import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import openBrowser from 'react-dev-utils/openBrowser';
import context from './common/context';
import generateTransfer from './common/generateTransfer';
import handleGenerateEntry from './common/generateEntry';
import generateWebpackConfig from './common/generateWebpackConfig';
import generateEnvironmentVariable from './common/generateEnvironmentVariable';

export default function start(program, dev) {
  // 初始化全局参数context
  const { initContext } = context;
  initContext(program, dev);

  // 前端环境变量方案处理
  generateEnvironmentVariable(true);

  const { choerodonConfig: { entryName, devServerConfig, output, port } } = context;
  // 生成入口文件
  generateTransfer(entryName);
  handleGenerateEntry(entryName);

  const webpackConfig = generateWebpackConfig('start', 'development');
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
