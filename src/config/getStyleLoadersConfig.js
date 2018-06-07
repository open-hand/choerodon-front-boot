export default (postcssOptions, modifyVarsOptions) => ([
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
        options: modifyVarsOptions,
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
        options: modifyVarsOptions,
      },
    ],
  },
]);
