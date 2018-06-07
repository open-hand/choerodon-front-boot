const path = require('path');

module.exports = {
  routes: { test: path.join(__dirname, './test/routeIndex') },
  server: 'http://api.choerodon.com.cn',
};
