/*
  editor: smilesoul 2018/2/8
*/

const HappyPack = require('happypack');
const config = require('./webpack.file');
const path = require('path');

const rules = [
  {
    enforce: 'pre',
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    loader: 'happypack/loader?id=eslint',
  },
  {
    enforce: 'pre',
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    loader: 'happypack/loader?id=tslint',
  },
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    loader: 'happypack/loader?id=babel',
  },
  {
    test: /\.test\.js$/,
    loader: 'happypack/loader?id=mocha',
    exclude: /node_modules/,
    include: /src\/app\/\*\/test\/\*\.test\.js/,
  },
  {
    test: /\.json$/,
    loader: 'json-loader',
  },
  {
    test: /\.(ts|tsx)$/,
    use: [
      {
        loader: 'babel-loader',
      },
      {
        loader: 'ts-loader',
      },
    ],
    exclude: /node_modules/,
  },
  {
    test: /\.css$/,
    use: [
      {
        loader: 'happypack/loader?id=css',
      },
    ],
  },
  {
    test: /\.less$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'less-loader',
        options: {
          sourceMap: true,
          modifyVars: config.themeSetting.antdTheme,
        },
      },
    ],
  },
  {
    test: /\.scss$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          modifyVars: config.themeSetting.antdTheme,
        },
      },
    ],
  }, {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&minetype=application/font-woff'
  }, {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&minetype=application/font-woff'
  }, {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&minetype=application/octet-stream'
  }, {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&minetype=application/vnd.ms-fontobject'
  }, {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url-loader?limit=10000&minetype=image/svg+xml'
  }, {
    test: /\.(png|jpg|jpeg|gif|ico)(\?v=\d+\.\d+\.\d+)?$/i,
    loader: 'url-loader?limit=10000'
  },
];

const happypackLoader = [new HappyPack({
  id: 'eslint',
  threads: 1,
  loaders: [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: path.resolve('.cache'),
      },
    },
    {
      path: 'eslint-loader',
      options: {
        emitError: true,
        failOnWarning: true,
        failOnError: true,
      },
    },
  ],
}),
new HappyPack({
  id: 'tslint',
  threads: 1,
  loaders: [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: path.resolve('.cache'),
      },
    },
    {
      path: 'tslint-loader',
      options: {
        emitError: true,
        failOnWarning: true,
        failOnError: true,
      },
    },
  ],
}),
new HappyPack({
  id: 'babel',
  threads: 3,
  loaders: [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: path.resolve('.cache'),
      },
    },
    {
      path: 'babel-loader',
    },
  ],
}),
new HappyPack({
  id: 'mocha',
  threads: 1,
  loaders: [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: path.resolve('.cache'),
      },
    },
    {
      path: 'mocha-loader',
    },
  ],
}),
new HappyPack({
  id: 'css',
  threads: 1,
  loaders: [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: path.resolve('.cache'),
      },
    },
    {
      path: 'style-loader',
    },
    {
      path: 'css-loader',
    },
  ],
})];

module.exports = {
  happypackLoader,
  rules
}
