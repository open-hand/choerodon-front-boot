import path from 'path';
import fs from 'fs';
import spawn from 'cross-spawn';
import moment from 'moment';
import context from '../utils/context';

const cwd = process.cwd();

function setRandomVersion() {
  const packagePath = path.join(cwd, 'package.json');
  const packageData = fs.readFileSync(packagePath);
  const parsePackageData = JSON.parse(packageData.toString());
  const newVersion = `${parsePackageData.version}-${moment().valueOf()}`;
  parsePackageData.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(parsePackageData, null, '\t'));
}

/**
 * 使用babel进行转义
 * 检测根目录下是否有`babel.config.js`，
 * 如果没有，使用boot里的配置
 * https://github.com/babel/babel/blob/master/packages/babel-cli/src/babel/options.js
 */

export default function compile(program) {
  const isTimeRandom = program.timeRandom;
  if (isTimeRandom) {
    setRandomVersion();
  }
  const userBabelConfigFile = path.join(cwd, 'babel.config.js');
  const configFile = fs.existsSync(userBabelConfigFile) ? userBabelConfigFile : path.join(__dirname, '../../babel.config.js');
  // eslint-disable-next-line camelcase
  const child_process = spawn('babel', [
    path.join(cwd, 'react'), // 源文件路径
    '--config-file', configFile, // babel配置文件路径
    '--out-dir', path.join(cwd, 'lib'), // 输出路径
    '--copy-files', // 拷贝其他文件
    '--delete-dir-on-start', // 编译前先删除原来的
    '--extensions', '.ts,.js,.jsx,.tsx',
  ],
  { stdio: 'inherit' });
  child_process.on('close', (code) => {
    if (code === 1) {
      process.exit(1);
    }
  });
}
