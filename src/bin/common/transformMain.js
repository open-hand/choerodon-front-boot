/**
 * 
 * @param {*} main 
 * @param {*} from 
 * @param {*} to 
 * main: ./lib/src/app/iam/containers/IAMIndex.js
 * from: lib
 * to: react
 * output: ./react/src/app/iam/containers/IAMIndex.js
 */
function transformMain(main, from, to) {
  const originMain = main;
  const originMainArr = originMain.split('/');
  const reactIndex = originMainArr.findIndex(v => v === from);
  if (reactIndex !== -1) {
    originMainArr[reactIndex] = to;
    return originMainArr.join('/');
  }
  return originMain;
}

module.exports = transformMain;
