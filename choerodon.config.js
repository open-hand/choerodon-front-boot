module.exports = {
  routes: { test: './test/routeIndex' },
  server: 'https://api.choerodon.com.cn',
  webSocketServer: 'ws://notify.choerodon.com.cn',
  dashboard: {
    iam: {
      components: 'test/dashboard/*',
      locale: 'test/locale/*',
    },
  },
};
