const program = require('commander');

program
  .option('-c, --config <path>', 'set config path. defaults to ./choerodon.config.js')
  .parse(process.argv);

const start = require('../lib/bin/start').default;

start(program, true);
