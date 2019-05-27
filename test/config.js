const config = {
  port: 2233,
  // proxyTarget: 'http://hap4.staging.saas.hand-china.com',
  api: {
    site: {
      url: 'api.choerodon.com.cn',
    },
    services: {
      name: 'agile',
      prefix: 'agile-service',
      modules: ['hap-core', 'hap-workflow', 'lov'],
    },
    modules: {},
  },
};

module.exports = config;
