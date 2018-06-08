'use strict';

const path = require('path');

module.exports = function getRunCmdEnv() {
  const env = {};
  Object.keys(process.env).forEach((key) => {
    env[key] = process.env[key];
  });
  const nodeModulesBinDir = path.join(__dirname, '../../node_modules/.bin');
  env.PATH = env.PATH ? `${nodeModulesBinDir}:${env.PATH}` : nodeModulesBinDir;
  return env;
};
