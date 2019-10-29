module.exports = {
  routes: { core: './test/routeIndex' },
  server: 'http://api.staging.saas.hand-china.com',
  webSocketServer: 'ws://notify.staging.saas.hand-china.com',
  master: './test/workspace/master.js',
  modules: [
    '.',
  ],
  emailBlackList: 'qq',
  runByBoot: true,
};
