const sass = require('sass');

function normalizeToSassVariables(modifyVarsOptions) {
  const { modifyVars, ...options } = modifyVarsOptions;
  if (modifyVars) {
    options.additionalData = Object.keys(modifyVars).map((key) => `$${key}: ${modifyVars[key]};`).join('');
  }
  return options;
}

const getStyleLoadersConfig = (postcssOptions, loaderOptions, useCssModules) => ([
  {
    test: /\.css$/,
    use: [{
      loader: 'css-loader',
      options: useCssModules ? {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]',
        },
      } : {},
    }, {
      loader: 'postcss-loader',
      options: postcssOptions,
    }],
  },
  {
    test: /\.less$/,
    use: [
      {
        loader: 'css-loader',
        options: useCssModules ? {
          modules: {
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        } : {},
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
      {
        loader: 'less-loader',
        options: {
          ...loaderOptions,
          lessOptions: {
            ...loaderOptions.lessOptions,
            javascriptEnabled: true,
          },
        },
      },
    ],
  },
  {
    test: /\.scss$/,
    use: [
      {
        loader: 'css-loader',
        options: useCssModules ? {
          modules: {
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        } : {},
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
      {
        loader: 'sass-loader',
        options: {
          ...normalizeToSassVariables(loaderOptions),
          implementation: sass,
        },
      },
    ],
  },
]);
export default getStyleLoadersConfig;
