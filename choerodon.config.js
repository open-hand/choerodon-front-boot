module.exports = {
  routes: { 'hap-core': './test/routeIndex' },
  server: 'http://api.staging.saas.hand-china.com',
  // server: 'https://api.choerodon.com.cn',
  webSocketServer: 'ws://notify.staging.saas.hand-china.com',
  // master: './src/containers/components/c7n/master/MasterDefault.jsx',
  master: './test/workspace/Cmp.js',
  dashboard: {},
  guide: {
    iam: {
      components: 'test/guide/*',
      locale: 'test/locale/*',
    },
  },
  emailBlackList: 'qq',
  runByBoot: true,
};
