import spawn from 'cross-spawn';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import context from './context';
import getProjectType from './getProjectType';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function parse(src, options) {
  const debug = Boolean(options && options.debug);
  const obj = {};

  src.toString().split('\n').forEach(function (line, idx) {
    const keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (keyValueArr != null) {
      const key = keyValueArr[1]

      let value = keyValueArr[2] || ''

      const len = value ? value.length : 0
      if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
        value = value.replace(/\\n/gm, '\n')
      }

      value = value.replace(/(^['"]|['"]$)/g, '').trim()

      obj[key] = value
    } else if (debug) {
      log(`did not match key and value when parsing line ${idx + 1}: ${line}`)
    }
  })

  return obj
}

function config(options) {
  let dotenvPath = path.resolve(process.cwd(), '.env')
  let encoding = 'utf8'
  let debug = false

  if (options) {
    if (options.path != null) {
      dotenvPath = options.path
    }
    if (options.encoding != null) {
      encoding = options.encoding
    }
    if (options.debug != null) {
      debug = true
    }
  }

  try {
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug })

    // Object.keys(parsed).forEach(function (key) {
    //   if (!process.env.hasOwnProperty(key)) {
    //     process.env[key] = parsed[key]
    //   } else if (debug) {
    //     log(`"${key}" is already defined in \`process.env\` and will not be overwritten`)
    //   }
    // })

    return { parsed }
  } catch (e) {
    return { error: e }
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
    const customEnvPath = path.join(process.cwd(), '.env');
    const dirEnvPath = path.join(__dirname, '../../..', '.env');
    if (fs.existsSync(customEnvPath) && !runByBoot) {
      fs.copyFileSync(customEnvPath, dirEnvPath);
    } else {
      fs.writeFile(dirEnvPath, '', 'utf8', null);
    }

    const customEnv = config('./env');
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
      `window.__env__ = ${JSON.stringify(combineEnv)};`,
    );
    callback();
  } else {
    callback();
  }
}

module.exports = generateEnvNode;
