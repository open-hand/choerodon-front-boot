import path from 'path';
import mkdirp from 'mkdirp';
import warning from './utils/warning';
import getChoerodonConfig from './webpackConfig/getChoerodonConfig';

let isInitialized = false;
function initialize(context) {
  if (isInitialized) {
    warning(false, '`context` had been initialized');
    return;
  }
  const tmpDirPath = path.join(__dirname, '../../../tmp');
  context.tmpDirPath = tmpDirPath;
  mkdirp.sync(tmpDirPath);
  Object.assign(exports, context);
  isInitialized = true;
}

exports.initContext = function initContext(program, dev) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const choerodonConfig = getChoerodonConfig(configFile);
  initialize({ choerodonConfig, isDev: dev });
};
