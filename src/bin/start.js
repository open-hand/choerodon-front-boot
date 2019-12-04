import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import openBrowser from 'react-dev-utils/openBrowser';
import gaze from 'gaze';
import context from './common/context';
import generateTransfer from './common/generateTransfer';
import handleGenerateEntry from './common/generateEntry';
import generateWebpackConfig from './common/generateWebpackConfig';
import generateEnvironmentVariable from './common/generateEnvironmentVariable';

function restart(program, dev, open = false) {
  // 初始化全局参数context
  const { initContext } = context;
  initContext(program, dev);
  // 前端环境变量方案处理
  generateEnvironmentVariable(true);

  const { choerodonConfig: { entryName, devServerConfig, output, port } } = context;
  // 生成入口文件
  generateTransfer(entryName);
  handleGenerateEntry(entryName);

  const webpackConfig = generateWebpackConfig('start', 'development', generateEnvironmentVariable(true));
  const serverOptions = {
    quiet: true,
    hot: true,
    ...devServerConfig,
    contentBase: [path.join(__dirname, '../../')], // 用于在本地启动时获取到生成的env-config.js
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
    () => {
      if (open) {
        openBrowser(`http://localhost:${port}`);
      }
    },
  );
  return server;
}
export default function start(program, dev) {
  let server = restart(program, dev, true);
  const configFiles = [program.config, './react/.env', './react/.default.env'].map((file) => path.join(process.cwd(), file));
  gaze(configFiles, (err, watcher) => {
    // Files have all started watching
    // Get all watched files
    const watched = watcher.watched();
    watcher.on('all', (event, filepath) => {
      const filename = path.basename(filepath);
      // eslint-disable-next-line no-console
      console.log(`Since ${filename} was ${event}, try to restart server...`);
      server.close(() => {
        server = restart(program, dev);
      });
    });
  });
}
