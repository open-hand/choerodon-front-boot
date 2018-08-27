import path from 'path';
import getChoerodonConfig from '../../config/getChoerodonConfig';
import context from './context';

export default function initialize(program, dev) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const choerodonConfig = getChoerodonConfig(configFile);
  context.initialize({ choerodonConfig, isDev: dev });
}
