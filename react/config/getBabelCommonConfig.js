import context from '../utils/context';

export default function babel(mode, env) {
  const { choerodonConfig } = context;
  const isEnvDevelopment = env === 'development';
  return choerodonConfig.babelConfig({
    cacheDirectory: true,
    presets: ['c7n-app'],
    plugins: [
      // ... other plugins
      isEnvDevelopment && require.resolve('react-refresh/babel'),
    ].filter(Boolean),
  }, mode, env);
}
