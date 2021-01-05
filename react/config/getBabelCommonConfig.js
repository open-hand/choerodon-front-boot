import context from '../utils/context';

export default function babel(mode, env) {
  const { choerodonConfig } = context;
  return choerodonConfig.babelConfig({
    cacheDirectory: true,
    presets: ['c7n'],
  }, mode, env);
}
