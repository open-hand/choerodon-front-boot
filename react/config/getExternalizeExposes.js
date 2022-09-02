/* eslint-disable no-restricted-syntax */
import fs from 'fs-extra';
import path from 'path';

function fileDisplay(filePath) {
  const externalFiles = {};
  // 根据文件路径读取文件，返回文件列表
  const files = fs.readdirSync(filePath);
  for (const filename of files) {
    const filedir = path.join(filePath, filename);
    // 根据文件路径获取文件信息，返回一个fs.Stats对象
    const stats = fs.statSync(filedir);
    const isFile = stats.isFile(); // 是文件
    if (isFile) {
      const fileContent = fs.readFileSync(filedir).toString('utf-8');
      const externalize = fileContent.match(/\/\* externalize: (.+) \*\//);
      if (externalize) {
        externalFiles[externalize[1]] = filedir;
      }
    }
    const isDir = stats.isDirectory(); // 是文件夹
    if (isDir) {
      const dirExternalFiles = fileDisplay(filedir);
      Object.assign(externalFiles, dirExternalFiles);// 递归，如果是文件夹，就继续遍历该文件夹下面的文件
    }
  }
  console.log('externalFiles===', externalFiles);
  return externalFiles;
}

export default function getExternalizeExposes() {
  return fileDisplay(path.resolve('react'));
}
// getExternalizeExposes();
