import path from 'path';
import fs from 'fs';
import getChoerodonConfig from '../../config/getChoerodonConfig';
import context from './context';

export default function initialize(program, dev) {
  let configFile = null;
  if (fs.existsSync(path.join(process.cwd(), '../config.default.js'))) {
    configFile = path.join(process.cwd(), '../config.default.js');
    program.config = '../config.default.js';
  } else {
    configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  }
  const choerodonConfig = getChoerodonConfig(configFile);
  context.initialize({ choerodonConfig, isDev: dev });
}
