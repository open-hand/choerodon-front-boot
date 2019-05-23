module.exports = {
  // routes: { 'hap-core': './test/routeIndex' },
  // proxyTarget: 'http://hap4.staging.saas.hand-china.com',
  // webSocketServer: 'http://hap4.staging.saas.hand-china.com',
  // server: '/api',
  // menuTheme: 'dark',
  // server: 'http://api.staging.saas.hand-china.com',
  // proxyTarget: 'http://api.staging.saas.hand-china.com',
  // dashboard: {
  //   iam: {
  //     components: 'test/dashboard/*',
  //     locale: 'test/locale/*',
  //   },
  // },
  // guide: {
  //   iam: {
  //     components: 'test/guide/*',
  //     locale: 'test/locale/*',
  //   },
  // },

  // use for c7n start
  routes: { 'hap-core': './test/routeIndex' },
  server: 'http://api.staging.saas.hand-china.com',
  webSocketServer: 'ws://notify.staging.saas.hand-china.com',
  // server: 'http://api.c7nf.choerodon.staging.saas.hand-china.com',
  master: './src/containers/components/c7n/master/MasterDefault.jsx',
  projectType: 'choerodon',
  buildType: 'single',
  dashboard: {},
  guide: {
    iam: {
      components: 'test/guide/*',
      locale: 'test/locale/*',
    },
  },

  // use for pro start
  // routes: { 'hap-core': './test/routeIndex' },
  // // proxyTarget: 'http://hap4.staging.saas.hand-china.com',
  // proxyTarget: 'http://hap4.c7nf.choerodon.staging.saas.hand-china.com',
  // master: './src/containers/components/pro/masterPro/MasterProDefault.js',
  // projectType: 'hap',
  // buildType: 'single',
};
