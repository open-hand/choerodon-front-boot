import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import context from './context';
import handleGenerateRoute from './entry/handleGenerateRoute';
import escapeWinPath from './utils/escapeWinPath';
import handleCollectRoute from './entry/handleCollectRoute';

export default function generateEntry(configEntryName) {
  const { tmpDirPath, isDev, choerodonConfig: { master } } = context;

  // 收集路由，单模块启动也得配置路径
  handleCollectRoute();

  const masterPathStr = `getMasters(${`function() { return import("${escapeWinPath(path.join(process.cwd(), master))}"); }`})`;
  
  // 生成路由文件
  const routesPath = handleGenerateRoute(configEntryName);

  // 生成主入口文件
  const entryPath = path.join(tmpDirPath, `entry.${configEntryName}.js`);
  const entryTemplate = fs.readFileSync(path.join(__dirname, './nunjucks/entry.nunjucks.js')).toString();
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      routesPath: escapeWinPath(routesPath),
      source: isDev ? 'src' : 'lib',
      master: masterPathStr,
    }),
  );
}
