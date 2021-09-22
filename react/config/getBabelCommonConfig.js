import context from '../utils/context';
// import uedConfig from '@hzero-front-ui/cfg/lib/utils/uedConfig';

export default function babel(mode, env) {
  const { choerodonConfig } = context;
  const isEnvDevelopment = env === 'development';
  return choerodonConfig.babelConfig({
    cacheDirectory: true,
    presets: ['c7n'],
    plugins: [
      // ... other plugins
      isEnvDevelopment && require.resolve('react-refresh/babel'),
      // ...uedConfig.generateC7nUiConfig(),
    ].filter(Boolean),
  }, mode, env);
}
