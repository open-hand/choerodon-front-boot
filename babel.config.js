module.exports = {
  presets: [['c7n-app', {
    envConfig: {
      useBuiltIns: 'entry',
      corejs: 3,
      modules: 'commonjs',
      exclude: ['transform-typeof-symbol', '@babel/plugin-transform-regenerator'],
    },
  }]],
};
