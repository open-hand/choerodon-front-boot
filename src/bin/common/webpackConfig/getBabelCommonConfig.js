import context from '../context';
import babelConfig from '../../../../babel.config';

export default function babel(mode, env) {
  const { choerodonConfig } = context;
  return choerodonConfig.babelConfig({
    cacheDirectory: true,
    ...babelConfig,
  }, mode, env);
}
