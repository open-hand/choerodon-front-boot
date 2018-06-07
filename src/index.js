import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import openBrowser from 'react-dev-utils/openBrowser';
import getWebpackCommonConfig from './config/getWebpackCommonConfig';
import updateWebpackConfig from './config/updateWebpackConfig';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const nunjucks = require('nunjucks');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const getChoerodonConfig = require('./config/getChoerodonConfig');
const context = require('./context');

const entryTemplate = fs.readFileSync(path.join(__dirname, 'entry.nunjucks.js')).toString();
const routesTemplate = fs.readFileSync(path.join(__dirname, 'routes.nunjucks.js')).toString();
const tmpDirPath = path.join(__dirname, '..', 'tmp');
mkdirp.sync(tmpDirPath);

function escapeWinPath(path) {
  return path.replace(/\\/g, '\\\\');
}

function getRoutesPath(configRoutes, configEntryName) {
  if (!configRoutes || !configRoutes.length) {
    const packageInfo = require(path.join(process.cwd(), 'package.json'));
    if (packageInfo) {
      const { main, name } = packageInfo;
      configRoutes = { [name.slice(name.lastIndexOf('-') + 1)]: path.join(process.cwd(), main) };
    }
  }

  const routesPath = path.join(tmpDirPath, `routes.${configEntryName}.js`);
  nunjucks.configure(routesPath, {
    autoescape: false,
  });
  fs.writeFileSync(
    routesPath,
    nunjucks.renderString(routesTemplate, {
      routes: Object.keys(configRoutes).map((key) => (
        `_react2['default'].createElement(
          _reactRouterDom.Route,
          {
            path: '/${key}',
            component: _asyncRouter2['default'](() => import('${escapeWinPath(configRoutes[key])}')),
          }
        ),`
      )).join('\n'),
    }),
  );
  return routesPath;
}

function generateEntryFile(configRoutes, configEntryName, root) {
  const entryPath = path.join(tmpDirPath, `entry.${configEntryName}.js`);
  const routesPath = getRoutesPath(
    configRoutes,
    configEntryName,
  );
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      routesPath: escapeWinPath(routesPath),
      root: escapeWinPath(root),
    }),
  );
}

exports.start = function start(program) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const choerodonConfig = getChoerodonConfig(configFile);
  context.initialize({ choerodonConfig });

  generateEntryFile(
    choerodonConfig.routes,
    choerodonConfig.entryName,
    '/',
  );

  const webpackConfig = updateWebpackConfig(getWebpackCommonConfig(), 'start');
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
};


exports.build = function build(program, callback) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const choerodonConfig = getChoerodonConfig(configFile);
  context.initialize({
    choerodonConfig,
    isBuild: true,
  });
  rimraf.sync(choerodonConfig.output);
  mkdirp.sync(choerodonConfig.output);

  const { entryName } = choerodonConfig;
  generateEntryFile(
    choerodonConfig.routes,
    entryName,
    choerodonConfig.root,
  );
  const webpackConfig = updateWebpackConfig(getWebpackCommonConfig(), 'build');
  webpackConfig.plugins.push(new webpack.LoaderOptionsPlugin({
    minimize: true,
  }),);
  webpackConfig.plugins.push(new UglifyJsPlugin({
    uglifyOptions: {
      output: {
        ascii_only: true,
      },
    },
  }));
  webpackConfig.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
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
};
