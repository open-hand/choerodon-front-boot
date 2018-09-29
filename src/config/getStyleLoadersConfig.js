function normalizeToSassVariables(modifyVarsOptions) {
  const { modifyVars, ...options } = modifyVarsOptions;
  if (modifyVars) {
    options.data = Object.keys(modifyVars).map(key => `$${key}: ${modifyVars[key]};`).join('');
  }
  return options;
}

export default (postcssOptions, loaderOptions) => ([
  {
    test: /\.css$/,
    use: [{
      loader: 'css-loader',
      options: {
        restructuring: false,
        autoprefixer: false,
      },
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
        options: {
          autoprefixer: false,
        },
      },
      {
        loader: 'postcss-loader',
        options: postcssOptions,
      },
      {
        loader: 'less-loader',
        options: loaderOptions,
      },
    ],
  },
  {
    test: /\.scss$/,
    use: [
      {
        loader: 'css-loader',
        options: {
          autoprefixer: false,
        },
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
