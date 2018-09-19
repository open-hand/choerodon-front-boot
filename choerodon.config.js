module.exports = {
  routes: { test: './test/routeIndex' },
  server: 'https://api.choerodon.com.cn',
  webSocketServer: 'ws://notify.staging.saas.hand-china.com',
  dashboard: {
    iam: {
      components: 'test/dashboard/*',
      locale: 'test/locale/*',
    },
  },
};
