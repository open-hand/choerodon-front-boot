const fs = require('fs');
const path = require('path');

/**
 * 获取generate-react目录下的模块名
 * （默认该目录下全为依赖模块）
 * 返回模块名数组
 */
function getSubmodule() {
  let vender = '';
  const cmpsPath = path.join(process.cwd(), 'src', 'main', 'resources', 'lib', 'dist', 'dis');
  const files = fs.readdirSync(cmpsPath);
  
  files.forEach((item) => {
    const stat = fs.lstatSync(`./src/main/resources/lib/dist/dis/${item}`);
    if (stat.isDirectory() !== true && item.startsWith('vendor')) {
      vender = item;
    }
  });

  return vender;
}

module.exports = getSubmodule;
