module.exports = {
  routes: { core: './test/routeIndex' },
  server: 'http://api.staging.saas.hand-china.com',
  webSocketServer: 'ws://notify.staging.saas.hand-china.com',
  master: {
    masterPath: './test/workspace/Cmp.js',
    exportPath: './test/workspace/export.js',
  },
  modules: [],
  emailBlackList: 'qq',
  runByBoot: true,
};
