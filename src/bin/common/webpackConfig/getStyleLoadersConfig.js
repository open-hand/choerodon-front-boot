function normalizeToSassVariables(modifyVarsOptions) {
  const { modifyVars, ...options } = modifyVarsOptions;
  if (modifyVars) {
    options.prependData = Object.keys(modifyVars).map((key) => `$${key}: ${modifyVars[key]};`).join('');
  }
  return options;
}

export default (postcssOptions, loaderOptions, useCssModules) => ([
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
        options: { ...loaderOptions, javascriptEnabled: true },
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
        options: normalizeToSassVariables(loaderOptions),
      },
    ],
  },
]);
