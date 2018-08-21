module.exports = {
  routes: { test: './test/routeIndex' },
  server: 'http://api.staging.saas.hand-china.com',
  dashboard: {
    iam: {
      components: 'test/dashboard/*',
      locale: 'test/locale/*',
    },
  },
};
