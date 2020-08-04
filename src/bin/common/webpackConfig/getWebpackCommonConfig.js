import { join } from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FilterWarningsPlugin from 'webpack-filter-warnings-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import WebpackBar from 'webpackbar';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import ThemeColorReplacer from 'webpack-theme-color-replacer';
import getBabelCommonConfig from './getBabelCommonConfig';
import colorPalette from '../utils/colorPalette';
import context from '../context';
import escapeWinPath from '../utils/escapeWinPath';

const jsFileName = 'dis/[name].[hash:8].js';
const jsChunkFileName = 'dis/chunks/[name].[chunkhash:5].chunk.js';
const cssFileName = 'dis/[name].[contenthash:8].css';
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

export default function getWebpackCommonConfig(mode, env) {
  const { isDev, choerodonConfig: { masterName = 'master', routes } } = context;
  const babelOptions = getBabelCommonConfig(mode, env);
  const ROUTES = Object.keys(routes).map((key) => ({
    key: `/${key}`,
    path: escapeWinPath(join(process.cwd(), routes[key])),
  }));
  const plugins = [
    new FilterWarningsPlugin({
      exclude: /.*@choerodon.*/,
    }),
    new MiniCssExtractPlugin({
      filename: cssFileName,
      chunkFilename: env === 'development' ? '[id].css' : '[id].[hash].css',
      ignoreOrder: true, // 不加控制台一堆warn
    }),
    new WebpackBar(),
    new webpack.ProvidePlugin({
      Choerodon: isDev
        ? join(process.cwd(), `node_modules/@choerodon/${masterName}/lib/containers/common`)
        : join(__dirname, `../../../${masterName}/lib/containers/common`),
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

  ];

  if (env === 'development') {
    plugins.push(
      new FriendlyErrorsWebpackPlugin(),
      new CaseSensitivePathsPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    );
  }
  return {
    mode: env,
    output: {
      filename: jsFileName,
      chunkFilename: jsChunkFileName,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial', // 只打包初始时依赖的第三方
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
    },
    resolve: {
      modules: ['node_modules', join(__dirname, '../../node_modules')],
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    resolveLoader: {
      modules: ['node_modules', join(__dirname, '../../node_modules')],
    },
    node: {
      fs: 'empty',
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
          test: /routes\.(js|jsx|ts|tsx)$/,
          use: [{
            loader: 'string-replace-loader',
            options: {
              search: '__ROUTES__',
              replace: ROUTES.map((route) => 'React.createElement(Route,{\n          path:"'.concat(route.key, '",\n          component:React.lazy(() => import("').concat(route.path, '"))\n        })')).join('\n'),
            },
          }],
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader(env, 'application/font-woff'),
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader(env, 'application/font-woff'),
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader(env, 'application/octet-stream'),
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader(env, 'application/vnd.ms-fontobject'),
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: getAssetLoader(env, 'image/svg+xml'),
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          use: getAssetLoader(env),
        },
      ],
    },
    plugins,
  };
}
