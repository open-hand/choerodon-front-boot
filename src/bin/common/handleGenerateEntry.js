import fs from 'fs';
import get from 'lodash/get';
import path from 'path';
import nunjucks from 'nunjucks';
import context from './context';
import handleGenerateRoute from './handleGenerateRoute';
import escapeWinPath from './utils/escapeWinPath';

export default function handleGenerateEntry(mainPackage, configEntryName) {
  const { tmpDirPath, isDev, choerodonConfig: { master } } = context;

  const masterPathStr = `getMasters(${`function() { return import("${escapeWinPath(path.join(process.cwd(), master))}"); }`}, 'choerodon')`;
  
  const routesPath = handleGenerateRoute(
    mainPackage,
    configEntryName,
  );

  const entryPath = path.join(tmpDirPath, `entry.${configEntryName}.js`);
  const entryTemplate = fs.readFileSync(path.join(__dirname, '../../nunjucks/entry.nunjucks.js')).toString();
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      routesPath: escapeWinPath(routesPath),
      source: isDev ? 'src' : 'lib',
      master: masterPathStr,
    }),
  );
}
