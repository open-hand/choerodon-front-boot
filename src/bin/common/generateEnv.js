import spawn from 'cross-spawn';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import context from './context';
import getProjectType from './getProjectType';

const fs = require('fs');
const path = require('path');

function parse(src, options) {
  const debug = Boolean(options && options.debug);
  const obj = {};

  src.toString().split('\n').forEach((line, idx) => {
    const keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (keyValueArr != null) {
      const key = keyValueArr[1];

      let value = keyValueArr[2] || '';

      const len = value ? value.length : 0;
      if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
        value = value.replace(/\\n/gm, '\n');
      }

      value = value.replace(/(^['"]|['"]$)/g, '').trim();

      obj[key] = value;
    } else if (debug) {
      // eslint-disable-next-line no-console
      console.log(`did not match key and value when parsing line ${idx + 1}: ${line}`);
    }
  });

  return obj;
}

function config(options) {
  let dotenvPath = path.resolve(process.cwd(), '.env');
  let encoding = 'utf8';
  let debug = false;

  if (options) {
    if (options.path != null) {
      dotenvPath = options.path;
    }
    if (options.encoding != null) {
      // eslint-disable-next-line prefer-destructuring
      encoding = options.encoding;
    }
    if (options.debug != null) {
      debug = true;
    }
  }

  try {
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });
    return { parsed };
  } catch (e) {
    return { error: e };
  }
}

/**
 * deprecated
 * @param {*} callback 
 */
function generateEnv(callback) {
  const { choerodonConfig: { runByBoot } } = context;
  const { isChoerodon } = getProjectType();
  if (isChoerodon) {
    const customEnvPath = path.join(process.cwd(), '.env');
    const dirEnvPath = path.join(__dirname, '../../..', '.env');
    if (fs.existsSync(customEnvPath) && !runByBoot) {
      fs.copyFileSync(customEnvPath, dirEnvPath);
    } else {
      fs.writeFile(dirEnvPath, '', 'utf8', null);
    }

    const shellPath = path.join(__dirname, '../../../', 'env.sh');
    spawn.sync(shellPath, ['development'], { cwd: path.join(__dirname, '../../../'), stdio: 'inherit' });
    callback();
  } else {
    callback();
  }
}

function generateEnvNode(callback, dev = false) {
  const { choerodonConfig: { runByBoot } } = context;
  const { isChoerodon } = getProjectType();
  if (isChoerodon) {
    const customEnvPath = runByBoot
      ? path.join(process.cwd(), '.env')
      : path.join(process.cwd(), './react/.env');
    const dirEnvPath = path.join(__dirname, '../../..', '.env');
    if (fs.existsSync(customEnvPath) && !runByBoot) {
      fs.copyFileSync(customEnvPath, dirEnvPath);
    } else {
      fs.writeFile(dirEnvPath, '', 'utf8', null);
    }

    const customEnv = config({
      path: dirEnvPath,
    });
    const defaultEnv = config({
      path: path.join(__dirname, '../../..', '.default.env'),
    });
    const combineEnv = dev
      ? customEnv.parsed
      : {
        ...defaultEnv.parsed,
        ...customEnv.parsed,
      };
    const envConfigPath = path.join(__dirname, '../../..', 'env-config.js');
    fs.writeFileSync(
      envConfigPath,
      `window._env_ = ${JSON.stringify(combineEnv)};`,
    );
    callback();
  } else {
    callback();
  }
}

module.exports = generateEnvNode;
