import { join } from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FilterWarningsPlugin from 'webpack-filter-warnings-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import WebpackBar from 'webpackbar';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import SvgToMiniDataURI from 'mini-svg-data-uri';
import getBabelCommonConfig from './getBabelCommonConfig';
import getStyleLoadersConfig from './getStyleLoadersConfig';
import getDefaultTheme from './getDefaultTheme';
import context from '../utils/context';
import escapeWinPath from '../utils/escapeWinPath';

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const DotEnvRuntimePlugin = require('dotenv-runtime-plugin');
const paths = require('./paths');

const jsFileName = 'dis/[name].[hash:8].js';
const jsChunkFileName = 'dis/chunks/[name].[chunkhash:5].chunk.js';
const cssFileName = 'dis/[name].[contenthash:8].css';
const assetFileName = 'dis/assets/[name].[hash:8].[ext]';

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
    devtool: isEnvDevelopment ? 'eval-cheap-module-source-map' : 'hidden-source-map',
    entry: {
      [entryName]: entry,
    },
    output: {
      path: join(process.cwd(), output),
      filename: jsFileName,
      chunkFilename: jsChunkFileName,
      publicPath: isEnvDevelopment ? '/' : root,
      clean: true, // 打包之前清除之前打包的东西,
      assetModuleFilename: assetFileName,
    },
    cache: {
      type: isEnvDevelopment ? 'memory' : 'filesystem', // 开启系统缓存增加第二次打包速度
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
      extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.overwrite.ts', '.overwrite.tsx', '.overwrite.js', '.overwrite.jsx', '.ts', '.tsx', '.js', '.jsx', '.json'],
      // TODO: 引用都改完后，这个可以去掉了
      alias: {
        '@choerodon/boot': '@choerodon/master',
        process: 'process/browser',
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
          test: /routes\.(js|jsx|ts|tsx)$/,
          use: [{
            loader: 'string-replace-loader',
            options: {
              multiple: [{
                search: '__ROUTES__',
                replace: `(()=>{
                  ${ROUTES.map((route) => `const ${route.key.replace('/', '')} = React.lazy(()=>import("${route.path}"));`).join('\n')}
                  return [${ROUTES.map((route) => `["${route.key}",${route.key.replace('/', '')} ]`).join(',\n')}]
                })()
                `,
              }, {
                search: '__INSTALLS__',
                replace: `${INSTALLS.map((install) => `import "${install}"`).join(';\n')}`,
              }],
            },
          }],
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
          // use: getAssetLoader(env, 'application/font-woff'),
          type: 'asset/resource',
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          // use: getAssetLoader(env, 'application/font-woff'),
          type: 'asset/resource',
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          // use: getAssetLoader(env, 'application/octet-stream'),
          type: 'asset/resource',
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          // use: getAssetLoader(env, 'application/vnd.ms-fontobject'),
          type: 'asset/resource',

        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          // use: getAssetLoader(env, 'image/svg+xml'),
          type: 'asset',
          exclude: /\.sprite\.svg$/,
          generator: {
            // 默认是呈现为使用 Base64 算法编码的文件内容
            dataUrl: (content) => SvgToMiniDataURI(content.toString()), // 自定义URL的转换规则，对于匹配到
          },
          parser: {
            dataUrlCondition: {
              maxSize: 100 * 1024, // 100kb 以下用inline形式转base64，否者直接source
            },
          },
        },
        {
          test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
          // use: getAssetLoader(env),
          type: 'asset', // 这里不确定使用inline还是用source方式去转换所以需按下面得配置
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024, // 10kb 以下用inline形式转base64，否者直接resource
            },
          },
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
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new HtmlWebpackPlugin({
        title: process.env.TITLE_NAME || titlename,
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
