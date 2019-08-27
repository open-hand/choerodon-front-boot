import path from 'path';
import mkdirp from 'mkdirp';
import warning from './utils/warning';

let isInitialized = false;
exports.initialize = function initialize(context) {
  if (isInitialized) {
    warning(false, '`context` had been initialized');
    return;
  }
  const tmpDirPath = path.join(__dirname, '../../../tmp');
  context.tmpDirPath = tmpDirPath;
  mkdirp.sync(tmpDirPath);
  Object.assign(exports, context);
  isInitialized = true;
};
