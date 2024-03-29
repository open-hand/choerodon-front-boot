import { join } from 'path';
import webpack from 'webpack';
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

function getEntry(entry, isPro) {
  if (typeof entry === 'string') { // master本地跑指定entry
    return {
      index: entry,
    };
  }
  if (!isPro) {
    entry.pop();
  }
  const obj = {};
  entry.forEach((item) => {
    Object.assign(obj, item);
  });
  return obj;
}

function getHtmlWebpackPlugin(entry, isEnvProduction, envStr) {
  function getPluginInstance(name, index = 0) {
    return new HtmlWebpackPlugin({
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
    });
  }
  const arr = [];
  if (typeof entry === 'string') {
    arr.push(getPluginInstance('index'));
  } else {
    entry.forEach((item, index) => {
      const name = Object.keys(item)[0];
      arr.push(getPluginInstance(name, index));
    });
  }

  return arr;
}

export default function getWebpackCommonConfig(mode, env, envStr) {
  const {
    choerodonConfig: {
      output, root,
      routes, installs, postcssConfig, theme, resourcesLevel, enterPoints, outward,
      titlename, entryName, entry, webpackConfig,
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
  let isPro = false;
  const INSTALLS = installs.map((key) => {
    if (key.indexOf('base-pro') !== -1) {
      isPro = true;
    }
    return escapeWinPath(join(process.cwd(), key));
  });
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
    devtool: isEnvDevelopment ? 'source-map' : undefined,
    entry: getEntry(entry, isPro),
    stats: 'normal',
    output: {
      path: join(process.cwd(), output),
      filename: jsFileName,
      chunkFilename: jsChunkFileName,
      publicPath: isEnvDevelopment ? '/' : root,
    },
    watchOptions: {
      // 对于node_modules仅监听猪齿鱼服务前缀的文件变化
      ignored: /node_modules\/(?!@choerodon\/.+)/,
    },
    snapshot: {
      // 去除此优化，避免yalc 无法使用，已对`watchOptions.ignored` 配置，确定监控范围
      managedPaths: [],
    },
    optimization: {
      splitChunks: {
        chunks: 'initial',
        name: false,
        minChunks: 1,
        maxAsyncRequests: 10, // 按需加载最大并行请求数量(default=5)
        maxInitialRequests: 5, // 一个入口的最大并行请求数量(default=3)
        minSize: 0,
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: -20,
            minChunks: 1,
            chunks: 'initial', // 只打包初始时依赖的第三方
            reuseExistingChunk: false,
          },
          ckeditor: {
            name: 'chunk-ckeditor',
            priority: 20,
            test: /[\\/]node_modules[\\/]@choerodon\/ckeditor[\\/]/,
          },
          prettier: {
            name: 'chunk-prettier',
            priority: 20,
            test: /[\\/]node_modules[\\/]prettier[\\/]/,
          },
          choerodonUI: {
            name: 'chunk-ui', // 单独将 UI 拆包
            priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
            test: /[\\/]node_modules[\\/]choerodon-ui[\\/]/,
          },
          pdf: {
            name: 'chunk-pdf',
            priority: 20,
            test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
          },
          quill: {
            name: 'chunk-quill',
            priority: 20,
            test: /[\\/]node_modules[\\/]quill[\\/]/,
          },
          echarts: {
            name: 'chunk-echarts',
            priority: 20,
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
          },
        },
      },
      ...isEnvProduction ? {
        minimizer: [
          new UglifyJsPlugin({
            parallel: true,
            sourceMap: true,
            uglifyOptions: {
              compress: {
                drop_debugger: true,
                drop_console: true,
              },
            },
          }),
          new CssMinimizerPlugin(),
        ],
      } : {},
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
          test: /registerOrganizationEntry\.(js|jsx|ts|tsx)$/,
          loader: 'string-replace-loader',
          options: {
            search: '__REGISTERORG__',
            replace: "import registerOrg from '@choerodon/base-pro/lib/routes/outward/register-organization'",
          },
        },
        {
          test: /routesCollections\.(js|jsx|ts|tsx)$/,
          loader: 'string-replace-loader',
          options: {
            search: '__ROUTES__',
            replace: `(()=>{
              ${ROUTES.map((route) => `const ${route.key.replace('/', '')} = React.lazy(()=>import("${route.path}"));`).join('\n')}
              return [${ROUTES.map((route) => `["${route.key}",${route.key.replace('/', '')} ]`).join(',\n')}]
            })()
            `,
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
    ].filter(Boolean),
  }, webpack);
}
