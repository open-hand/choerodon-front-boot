import path from 'path';
import warning from './warning';
import getChoerodonConfig from '../config/getChoerodonConfig';

let isInitialized = false;
function initialize(context) {
  if (isInitialized) {
    warning(false, '`context` had been initialized');
    return;
  }
  Object.assign(exports, context);
  isInitialized = true;
}

exports.initContext = function initContext(program, dev) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const choerodonConfig = getChoerodonConfig(configFile);
  initialize({ choerodonConfig, isDev: dev });
};
