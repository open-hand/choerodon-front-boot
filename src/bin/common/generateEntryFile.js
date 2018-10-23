import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import context from './context';
import getRoutesPath from './getRoutesPath';
import getDashBoardPath from './getDashBoardPath';
import getGuidePath from './getGuidePath';
import escapeWinPath from './escapeWinPath';

const entryTemplate = fs.readFileSync(path.join(__dirname, '../../nunjucks/entry.nunjucks.js')).toString();

export default function generateEntryFile(mainPackage, configEntryName) {
  const { tmpDirPath, isDev } = context;
  const entryPath = path.join(tmpDirPath, `entry.${configEntryName}.js`);
  const dashboardPath = getDashBoardPath(configEntryName);
  const guidePath = getGuidePath(configEntryName);
  console.log(dashboardPath, guidePath);
  const routesPath = getRoutesPath(
    mainPackage,
    configEntryName,
    dashboardPath,
  );
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      routesPath: escapeWinPath(routesPath),
      guidePath: escapeWinPath(guidePath),
      source: isDev ? 'src' : 'lib',
    }),
  );
}
