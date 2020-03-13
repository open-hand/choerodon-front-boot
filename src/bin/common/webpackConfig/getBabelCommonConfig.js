import context from '../context';

export default function babel(mode, env) {
  const { choerodonConfig } = context;
  return choerodonConfig.babelConfig({
    presets: [
      ['@babel/preset-env', {
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
  }, mode, env);
}
