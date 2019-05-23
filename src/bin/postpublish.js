import fs from 'fs';
import getPackagePath from './common/getPackagePath';

export default function start(program, dev) {
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);

  // "./lib/src/app/iam/containers/IAMIndex.js"
  // -> "./react/src/app/iam/containers/IAMIndex.js"
  const originMain = mainPackage.main;
  const originMainArr = originMain.split('/');
  const reactIndex = originMainArr.findIndex(v => v === 'lib');
  if (reactIndex !== -1) {
    originMainArr[reactIndex] = 'react';
    mainPackage.main = originMainArr.join('/');

    fs.writeFileSync(
      mainPackagePath,
      JSON.stringify(mainPackage, null, 2),
    );
  }
}
