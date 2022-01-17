import os from 'os';
import path from 'path';
import fs from 'fs';
import spawn from "cross-spawn";

const cwd = process.cwd();

export default function bootstrap() {
  // win darwin
  // 操作系统
  const platform = os.platform();
  // 是否win系统
  const isWin = platform.startsWith('win');
  // package.lock路径
  const lockFilePath = path.join(cwd, 'package-lock.json');
  // 是否有lock文件
  const hasLockFile = fs.existsSync(lockFilePath);

  console.log('操作系统为：'+ platform);

  console.log(hasLockFile ? '监测到lock文件' : '未监测到lock文件')

  let child_process;

  if (!hasLockFile) {
    let script = 'npm install --registry https://nexus.choerodon.com.cn/repository/choerodon-npm';
    if (!isWin) {
      script += ' && chmod -R u+x node_modules';
    }
    console.log(script);
    child_process = spawn(script,
      {
        stdio: 'inherit',
        shell: true
      });

  } else {
    const lockFileData = fs.readFileSync(lockFilePath);
    const parseLockData = JSON.parse(lockFileData.toString())
    const lockDependencies = parseLockData?.dependencies;
    const choerodonKeys = Object.keys(lockDependencies).filter(key => key.includes('choerodon'));
    if (choerodonKeys && choerodonKeys.length > 0) {
      console.log('监测到有choerodon包lock依赖');
      choerodonKeys.forEach(key => {
        delete lockDependencies[key]
      })
    } else {
      console.log('未监测到有choerodon包lock依赖')
    }
    parseLockData.dependencies = lockDependencies;
    fs.writeFileSync(lockFilePath, JSON.stringify(parseLockData));

    let script = 'npm install --no-save --registry https://nexus.choerodon.com.cn/repository/choerodon-npm';
    if (!isWin) {
      script += ' && chmod -R u+x node_modules';
    }
    console.log(script)
    child_process = spawn(script,
      {
        stdio: 'inherit',
        shell: true
      });
  }
  child_process.on('close', (code) => {
    if (code === 1) {
      process.exit(1);
    }
  });
}


