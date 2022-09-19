const path = require('path');

module.exports = function getPackageInfo(base = '.') {
  return require(base.startsWith('.') ? path.resolve(base, 'package.json') : require.resolve(`${base}/package.json`));
};
