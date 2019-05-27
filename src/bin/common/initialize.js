import path from 'path';
import getChoerodonConfig from '../../config/getChoerodonConfig';
import context from './context';

function checkRequiredProp(choerodonConfig) {
  const requiredProps = ['projectType', 'buildType', 'master'];
  if (!requiredProps.every(prop => choerodonConfig[prop])) {
    // eslint-disable-next-line no-console
    console.log('缺失部分属性');
    process.on('SIGINT', () => {
      process.exit(0);
    });
  }
}

export default function initialize(program, dev) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const choerodonConfig = getChoerodonConfig(configFile);
  checkRequiredProp(choerodonConfig);
  context.initialize({ choerodonConfig, isDev: dev });
}
