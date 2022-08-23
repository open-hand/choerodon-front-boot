import { join } from 'path';
import webpack, { container } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FilterWarningsPlugin from 'webpack-filter-warnings-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import WebpackBar from 'webpackbar';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import ThemeColorReplacer from 'webpack-theme-color-replacer';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import PreloadWebpackPlugin from 'preload-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import fs from 'fs';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

import getBabelCommonConfig from './getBabelCommonConfig';
import getStyleLoadersConfig from './getStyleLoadersConfig';
import getDefaultTheme from './getDefaultTheme';
import colorPalette from '../utils/colorPalette';
import context from '../utils/context';
import escapeWinPath from '../utils/escapeWinPath';

const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const DotEnvRuntimePlugin = require('dotenv-runtime-plugin');
const paths = require('./paths');

const cwd = process.cwd();

const eagerList = [

];

const {
  ModuleFederationPlugin,
} = container;

const cssColorFileName = 'dis/theme-colors.css';
const assetFileName = 'dis/assets/[name].[hash:8].[ext]';
const baseColor = '#3f51b5';
function changeSelector(selector, util) {
  // ui-pro替换这个样式后选择框样式有问题
  switch (selector) {
    case '.c7n-pro-calendar-today .c7n-pro-calendar-cell-inner':
      return `${selector}.dropBy-@choerodon/boot`;
    case '.c7n-calendar-today .c7n-calendar-date':
      return `${selector}.dropBy-@choerodon/boot`;
    default:
      return selector;
  }
}
function getAssetLoader(env, mimetype, limit = 10000) {
  return {
    loader: 'url-loader',
    options: {
      limit,
      mimetype,
      name: assetFileName,
    },
  };
}

function getEntry(entry) {
  const obj = {};
  entry.forEach((item) => {
    Object.assign(obj, item);
  });
  return obj;
}

function getPackageRouteName() {
  const packagePath = path.join(cwd, 'package.json');
  const packageData = fs.readFileSync(packagePath);
  const parsePackageData = JSON.parse(packageData.toString());
  return parsePackageData.routeName;
}

function getExpose() {
  const packagePath = path.join(cwd, 'package.json');
  const packageData = fs.readFileSync(packagePath);
  const parsePackageData = JSON.parse(packageData.toString());
  if (parsePackageData.nonExpose && parsePackageData.nonExpose === 'true') {
    return {};
  }
  return {
    './index': './react/index.js',
  };
}

function getShared() {
  const packagePath = path.join(cwd, './node_modules/@choerodon/boot/package.json');
  const packageData = fs.readFileSync(packagePath);
  const parsePackageData = JSON.parse(packageData.toString());
  const dep = parsePackageData.dependencies;
  const obj = {
    ckeditor: {
      singleton: true,
      eager: true,
    },
    '@choerodon/ckeditor': {
      singleton: true,
      eager: true,
    },
    react: {
      singleton: true,
      requiredVersion: '16.14.0',
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '16.14.0',
    },
    'react-router-dom': {
      singleton: true,
      requiredVersion: '^5.1.2',
    },
    'react-router': {
      singleton: true,
      requiredVersion: '^5.1.2',
    },
    'choerodon-ui/dataset': {
      singleton: true,
      requiredVersion: false,
    },
    'choerodon-ui/shared': {
      singleton: true,
      requiredVersion: false,
    },
    axios: {
      singleton: true,
      requiredVersion: '^0.16.2',
    },
    'react-query': {
      singleton: true,
      requiredVersion: '^3.34.6',
    },
  };
  Object.keys(dep).forEach((item) => {
    obj[item] = {
      singleton: true,
      requiredVersion: dep[item],
    };
    if (eagerList.includes(item)) {
      obj[item] = {
        ...obj[item],
        eager: true,
      };
    }
  });
  return obj;
}

function getRemotes(envStr, modules) {
  const regex = /\{(.+?)\}/g;
  const env = JSON.parse(envStr.match(regex)[0]);
  const obj = {};
  modules.forEach((item) => {
    if (env[item]) {
      obj[item] = JSON.stringify(`${item}@${env[item]}/remoteEntry.js`);
    }
  });
  return obj;
}

function loadComponent(scope, module, onError) {
  return async () => {
    // eslint-disable-next-line no-undef
    await __webpack_init_sharing__('default');
    const container1 = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    if (!container1) {
      throw new Error('加载了错误的importManifest.js，请检查服务版本');
    }
    try {
      // eslint-disable-next-line no-undef
      await container1.init(__webpack_share_scopes__.default);
      const factory = await window[scope].get(module);
      const Module = factory();
      return Module;
    } catch (e) {
      if (onError) {
        return onError(e);
      }
      throw e;
    }
  };
}

function getRoutesStringReplace(ROUTES, modules, envStr) {
  // const regex = /\{(.+?)\}/g;
  // const env = JSON.parse(envStr.match(regex)[0]);
  // modules.forEach((i) => {
  //   if (i !== '.' && env[i]) {
  //     const script = document.createElement('script');
  //     script.src = env[i];
  //     script.crossOrigin = true;
  //     document.body.appendChild(script);
  //     const lazyComponent = loadComponent(i, './index');
  //   }
  // });
  // console.log(modules, envStr);
  const str = `(()=>{
    ${ROUTES.map((route) => `const ${route.key.replace('/', '')} = React.lazy(()=>import("${route.path}"));`).join('\n')}
    return [${ROUTES.map((route) => `["${route.key}",${route.key.replace('/', '')} ]`).join(',\n')}]
  })()`;

  return str;
}

function getHtmlWebpackPlugin(entry, isEnvProduction, envStr) {
  const arr = [];
  entry.forEach((item, index) => {
    const name = Object.keys(item)[0];
    arr.push(
      new HtmlWebpackPlugin({
        filename: `${name}.html`,
        title: process.env.TITLE_NAME || '',
        chunks: [`${name}`],
        template: paths.appHtml[index],
        inject: true,
        favicon: paths.appFavicon,
        env: isEnvProduction ? envStr : undefined,
        minify: {
          html5: true,
          collapseWhitespace: true,
          removeComments: true,
          removeTagWhitespace: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
        },
      }),
    );
  });
  return arr;
}

export default function getWebpackCommonConfig(mode, env, envStr) {
  const {
    choerodonConfig: {
      output, root,
      routes, installs, postcssConfig, theme, resourcesLevel, enterPoints, outward,
      titlename, entryName, entry, webpackConfig, modules, routeName, port,
    },
  } = context;
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';

  const jsFileName = isEnvDevelopment ? 'dis/[name].js' : 'dis/[name].[fullhash:8].js';
  const jsChunkFileName = isEnvDevelopment ? 'dis/chunks/[name].chunk.js' : 'dis/chunks/[name].[fullhash:5].chunk.js';
  const cssFileName = isEnvDevelopment ? 'dis/[name].css' : 'dis/[name].[hash:8].css';

  const babelOptions = getBabelCommonConfig(mode, env);
  const ROUTES = Object.keys(routes).map((key) => ({
    key: `/${key}`,
    path: escapeWinPath(join(process.cwd(), routes[key])),
  }));
  const INSTALLS = installs.map((key) => escapeWinPath(join(process.cwd(), key)));
  const styleLoadersConfig = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    lessOptions: {
      modifyVars: { ...getDefaultTheme(env), ...theme },
    },
  });
  const styleLoadersConfigWithCssLoader = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    lessOptions: {
      modifyVars: { ...getDefaultTheme(env), ...theme },
    },
  }, true);
  const mergedEnterPoints = {
    NODE_ENV: env,
    RESOURCES_LEVEL: Array.isArray(resourcesLevel) ? resourcesLevel.join(',') : resourcesLevel,
    OUTWARD: outward,
    ...enterPoints(mode, env),
  };
  const defines = Object.keys(mergedEnterPoints).reduce((obj, key) => {
    // eslint-disable-next-line no-param-reassign
    obj[`process.env.${key}`] = JSON.stringify(process.env[key] || mergedEnterPoints[key]);
    return obj;
  }, {});
  return webpackConfig({
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    devtool: isEnvDevelopment ? 'cheap-module-source-map' : undefined,
    entry: getEntry(entry),
    stats: 'normal',
    output: {
      path: join(process.cwd(), output),
      filename: jsFileName,
      chunkFilename: jsChunkFileName,
      publicPath: 'auto',
    },
    watchOptions: {
      // 对于node_modules仅监听猪齿鱼服务前缀的文件变化
      ignored: /node_modules\/(?!@choerodon\/.+)/,
    },
    // optimization: {
    //   splitChunks: {
    //     chunks: 'initial',
    //     name: false,
    //     minChunks: 1,
    //     maxAsyncRequests: 10, // 按需加载最大并行请求数量(default=5)
    //     maxInitialRequests: 5, // 一个入口的最大并行请求数量(default=3)
    //     minSize: 0,
    //     cacheGroups: {
    //       libs: {
    //         name: 'chunk-libs',
    //         test: /[\\/]node_modules[\\/]/,
    //         priority: -20,
    //         minChunks: 1,
    //         chunks: 'initial', // 只打包初始时依赖的第三方
    //         reuseExistingChunk: false,
    //       },
    //       ckeditor: {
    //         name: 'chunk-ckeditor',
    //         priority: 20,
    //         test: /[\\/]node_modules[\\/]@choerodon\/ckeditor[\\/]/,
    //       },
    //       prettier: {
    //         name: 'chunk-prettier',
    //         priority: 20,
    //         test: /[\\/]node_modules[\\/]prettier[\\/]/,
    //       },
    //       choerodonUI: {
    //         name: 'chunk-ui', // 单独将 UI 拆包
    //         priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
    //         test: /[\\/]node_modules[\\/]choerodon-ui[\\/]/,
    //       },
    //       pdf: {
    //         name: 'chunk-pdf',
    //         priority: 20,
    //         test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
    //       },
    //       quill: {
    //         name: 'chunk-quill',
    //         priority: 20,
    //         test: /[\\/]node_modules[\\/]quill[\\/]/,
    //       },
    //       echarts: {
    //         name: 'chunk-echarts',
    //         priority: 20,
    //         test: /[\\/]node_modules[\\/]echarts[\\/]/,
    //       },
    //     },
    //   },
    //   ...isEnvProduction ? {
    //     minimizer: [
    //       new UglifyJsPlugin({
    //         parallel: true,
    //         sourceMap: true,
    //         uglifyOptions: {
    //           compress: {
    //             drop_debugger: true,
    //             drop_console: true,
    //           },
    //         },
    //       }),
    //       new CssMinimizerPlugin(),
    //     ],
    //   } : {},
    // },
    snapshot: {
      // 去除此优化，避免yalc 无法使用，已对`watchOptions.ignored` 配置，确定监控范围
      managedPaths: [],
    },
    resolve: {
      modules: ['node_modules', join(__dirname, '../../node_modules')],
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.overwrite.ts', '.overwrite.tsx', '.overwrite.js', '.overwrite.jsx', '.ts', '.tsx', '.js', '.jsx', '.json'],
      // TODO: 引用都改完后，这个可以去掉了
      alias: {
        '@choerodon/boot': '@choerodon/master',
      },
      fallback: {
        fs: false,
        path: false,
        url: require.resolve('url'),
        buffer: require.resolve('buffer'),
      },
    },
    resolveLoader: {
      modules: ['node_modules', join(__dirname, '../../node_modules'), join(__dirname, '../plugin')],
    },
    module: {
      noParse: [/moment.js/],
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: babelOptions,

        },
        {
          test: /moduleInjects\.(js|jsx|ts|tsx)$/,
          loader: 'string-replace-loader',
          options: {
            search: '__INSTALLS__',
            replace: `${INSTALLS.map((install) => `import "${install}"`).join(';\n')}`,
          },
        },
        {
          test: /routesCollections\.(js|jsx|ts|tsx)$/,
          loader: 'string-replace-loader',
          options: {
            search: '__MODULES__',
            replace: `[${modules.map((i) => `"${i}"`)}]`,
          },
        },
        {
          test: /routesCollections\.(js|jsx|ts|tsx)$/,
          loader: 'string-replace-loader',
          options: {
            search: '__ROUTES__',
            replace: getRoutesStringReplace(ROUTES, modules, envStr),
          },
        },
        ...styleLoadersConfig.map((config, index) => ({
          oneOf: [{
            test: config.test,
            resourceQuery: /modules/,
            use: [isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader, ...styleLoadersConfigWithCssLoader[index].use],
          }, {
            test: config.test,
            use: [isEnvDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader, ...config.use],
          }],
        })),
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          // use: getAssetLoader(env, 'application/font-woff'),
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          // use: getAssetLoader(env, 'application/font-woff'),
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          // use: getAssetLoader(env, 'application/octet-stream'),
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          // use: getAssetLoader(env, 'application/vnd.ms-fontobject'),
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          // use: getAssetLoader(env, 'image/svg+xml'),
          type: 'asset/resource',
          exclude: /\.sprite\.svg$/,
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          type: 'asset/resource',
          // use: getAssetLoader(env),
        },
        {
          test: /\.svg$/,
          loader: 'svg-sprite-loader',
          include: /\.sprite\.svg$/,
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      isEnvDevelopment && new DotEnvRuntimePlugin({
        entry: paths.dotenv,
      }),
      new ThemeColorReplacer({
        changeSelector,
        fileName: cssColorFileName,
        matchColors: [
          colorPalette(baseColor, 1),
          colorPalette(baseColor, 2),
          colorPalette(baseColor, 3),
          colorPalette(baseColor, 4),
          colorPalette(baseColor, 5),
          baseColor,
          colorPalette(baseColor, 7),
          colorPalette(baseColor, 8),
          colorPalette(baseColor, 9),
          colorPalette(baseColor, 10),
          '#303f9f', // 左上角颜色
          '140, 158, 255, 0.12', // menu-item背景
          '140, 158, 255, 0.16', // 左侧菜单menu-item背景
        ],
        injectCss: true,
        isJsUgly: env !== 'development',
      }),
      new FilterWarningsPlugin({
        exclude: /.*@choerodon.*/,
      }),
      new MiniCssExtractPlugin({
        filename: cssFileName,
        chunkFilename: env === 'development' ? '[id].css' : '[id].[contenthash].css',
        ignoreOrder: true, // 不加控制台一堆warn
      }),
      new WebpackBar(),
      new webpack.DefinePlugin(defines),
      ...getHtmlWebpackPlugin(entry, isEnvProduction, envStr),
      isEnvDevelopment && new ForkTsCheckerWebpackPlugin(),
      isEnvDevelopment && new FriendlyErrorsWebpackPlugin(),
      isEnvDevelopment && new CaseSensitivePathsPlugin(),
      isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      isEnvDevelopment && new ReactRefreshWebpackPlugin({
        overlay: false,
      }),
      new ModuleFederationPlugin({
        filename: 'remoteEntry.js',
        name: getPackageRouteName(),
        library: {
          type: 'var',
          name: getPackageRouteName(),
        },
        exposes: getExpose(),
        shared: getShared(),
        // remotes: getRemotes(envStr, modules),
      }),
    ].filter(Boolean),
  }, webpack);
}
