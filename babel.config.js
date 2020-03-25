module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      corejs: 3,
      useBuiltIns: 'entry',
    }],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    'lodash',
    [
      'import',
      {
        libraryName: 'choerodon-ui',
        style: true,
      },
      'choerodon-ui',
    ],
    [
      'import',
      {
        libraryName: 'choerodon-ui/pro',
        style: true,
      },
      'choerodon-ui-pro',
    ],
    ['try-import', {
      tryImport: 'C7NTryImport',
      hasModule: 'C7NHasModule',
    }],
  ],
};
