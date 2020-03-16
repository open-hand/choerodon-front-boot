function normalizeToSassVariables(modifyVarsOptions) {
  const { modifyVars, ...options } = modifyVarsOptions;
  if (modifyVars) {
    options.prependData = Object.keys(modifyVars).map((key) => `$${key}: ${modifyVars[key]};`).join('');
  }
  return options;
}

export default (postcssOptions, loaderOptions) => ([
  {
    test: /\.css$/,
    use: [{
      loader: 'css-loader',
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
