import path from 'path';
import mkdirp from 'mkdirp';

let isInitialized = false;
exports.initialize = function (context) {
  if (isInitialized) {
    console.error('`context` had been initialized');
    return;
  }
  const tmpDirPath = context.tmpDirPath = path.join(__dirname, '../../../tmp');
  mkdirp.sync(tmpDirPath);
  Object.assign(exports, context);
  isInitialized = true;
};
