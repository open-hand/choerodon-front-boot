import fs from 'fs';
import getPackagePath from './common/getPackagePath';

export default function start(program, dev) {
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);

  // "./react/src/app/iam/containers/IAMIndex.js"
  // -> "./lib/src/app/iam/containers/IAMIndex.js"
  const originMain = mainPackage.main;
  const originMainArr = originMain.split('/');
  const reactIndex = originMainArr.findIndex(v => v === 'react');
  if (reactIndex !== -1) {
    originMainArr[reactIndex] = 'lib';
    mainPackage.main = originMainArr.join('/');

    fs.writeFileSync(
      mainPackagePath,
      JSON.stringify(mainPackage, null, 2),
    );
  }
}
