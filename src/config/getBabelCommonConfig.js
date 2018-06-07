import { tmpdir } from 'os';

const context = require('../context');

export default function babel() {
  const { choerodonConfig } = context;
  return choerodonConfig.babelConfig({
    'presets': [
      'react',
      [
        'es2015',
      ],
      'stage-1',
    ],
    'plugins': [
      'transform-async-to-generator',
      'transform-decorators-legacy',
      'transform-class-properties',
      'transform-runtime',
      'lodash',
      [
        'import',
        {
          'libraryName': 'choerodon-ui',
          'style': true,
        },
      ],
    ],
  });
}
