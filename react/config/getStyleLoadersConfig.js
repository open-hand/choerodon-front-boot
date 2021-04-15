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
      options: { postcssOptions },
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
        options: { postcssOptions },
      },
      {
        loader: 'less-loader',
        options: { lessOptions: { ...loaderOptions, javascriptEnabled: true } },
      },
    ],
  },
]);
export default getStyleLoadersConfig;
