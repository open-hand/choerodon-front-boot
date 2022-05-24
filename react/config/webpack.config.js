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
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';


import getBabelCommonConfig from './getBabelCommonConfig';
import getStyleLoadersConfig from './getStyleLoadersConfig';
import getDefaultTheme from './getDefaultTheme';
import colorPalette from '../utils/colorPalette';
import context from '../utils/context';
import escapeWinPath from '../utils/escapeWinPath';

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const DotEnvRuntimePlugin = require('dotenv-runtime-plugin');
const paths = require('./paths');

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
  const babelOptions = getBabelCommonConfig(mode, env);
  const ROUTES = Object.keys(routes).map((key) => ({
    key: `/${key}`,
    path: escapeWinPath(join(process.cwd(), routes[key])),
  }));
  const INSTALLS = installs.map((key) => escapeWinPath(join(process.cwd(), key)));
  const styleLoadersConfig = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    modifyVars: { ...getDefaultTheme(env), ...theme },
  });
  const styleLoadersConfigWithCssLoader = getStyleLoadersConfig(postcssConfig, {
    sourceMap: mode === 'start',
    modifyVars: { ...getDefaultTheme(env), ...theme },
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
    watch: isEnvDevelopment,
    devtool: isEnvDevelopment ? 'source-map' : undefined,
    entry: {
      [entryName]: entry,
    },
    output: {
      path: join(process.cwd(), output),
      filename: jsFileName,
      chunkFilename: jsChunkFileName,
      publicPath: isEnvDevelopment ? '/' : root,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: true,
        minChunks: 1,
        maxAsyncRequests: 10, // 按需加载最大并行请求数量(default=5)
        maxInitialRequests: 5, // 一个入口的最大并行请求数量(default=3)
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            minChunks: 1,
            chunks: 'initial', // 只打包初始时依赖的第三方
            maxSize: 2048,
            reuseExistingChunk: true,
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
    },
    resolve: {
      modules: ['node_modules', join(__dirname, '../../node_modules')],
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.overwrite.ts', '.overwrite.tsx', '.overwrite.js', '.overwrite.jsx', '.ts', '.tsx', '.js', '.jsx', '.json'],
      // TODO: 引用都改完后，这个可以去掉了
      alias: {
        '@choerodon/boot': '@choerodon/master',
      },
    },
    resolveLoader: {
      modules: ['node_modules', join(__dirname, '../../node_modules'), join(__dirname, '../plugin')],
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
          use: [
            'babel-loader',
          ],
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
          exclude: /\.sprite\.svg$/,
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          use: getAssetLoader(env),
        },
        {
          test: /\.svg$/,
          loader: 'svg-sprite-loader',
          include: /\.sprite\.svg$/,
        },
      ],
    },
    plugins: [
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
        chunkFilename: env === 'development' ? '[id].css' : '[id].[hash].css',
        ignoreOrder: true, // 不加控制台一堆warn
      }),
      new WebpackBar(),
      new webpack.DefinePlugin(defines),
      new HtmlWebpackPlugin({
        // title: process.env.TITLE_NAME || titlename,
        title: process.env.TITLE_NAME || '',
        template: paths.appHtml,
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
