const evalSourceMapMiddleware = require('../dev-utils/evalSourceMapMiddleware');
const paths = require('./paths');

const host = process.env.HOST || 'localhost';
module.exports = function (allowedHost) {
  return {
    allowedHosts: 'all',
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    // clientLogLevel: 'none',
    // Enable hot reloading server. It will provide WDS_SOCKET_PATH endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // It is important to tell WebpackDevServer to use the same "publicPath" path as
    // we specified in the webpack config. When homepage is '.', default to serving
    // from the root.
    // remove last slash so user can land on `/test` instead of `/test/`
    // publicPath: paths.publicUrlOrPath.slice(0, -1),
    // publicPath: '/',
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.hooks[...].tap` calls above.
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebook/create-react-app/issues/293
    // src/node_modules is not ignored to support absolute imports
    // https://github.com/facebook/create-react-app/issues/1065
    // watchOptions: {
    //   ignored: ignoredFiles(paths.appSrc),
    // },
    host,
    client: {
      overlay: false,
    },
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    // onBeforeSetupMiddleware(devServer) {
    //   // Keep `evalSourceMapMiddleware` and `errorOverlayMiddleware`
    //   // middlewares before `redirectServedPath` otherwise will not have any effect
    //   // This lets us fetch source contents from webpack for the error overlay
    //   devServer.app.use(evalSourceMapMiddleware(devServer.server));
    // },
  };
};
