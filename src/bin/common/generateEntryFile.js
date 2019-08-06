import fs from 'fs';
import get from 'lodash/get';
import path from 'path';
import nunjucks from 'nunjucks';
import context from './context';
import getRoutesPath from './getRoutesPath';
import escapeWinPath from './escapeWinPath';
import getProjectType from './getProjectType';
import getDashBoardPath from './getDashBoardPath';
import getGuidePath from './getGuidePath';

export default function generateEntryFile(mainPackage, configEntryName) {
  const { tmpDirPath, isDev, choerodonConfig: { master } } = context;
  const { projectType, isChoerodon } = getProjectType();

  let masterPathStr;
  if (['@choerodon/master', '@choerodon/pro-master'].includes(master)) {
    masterPathStr = `getMasters(${`function() { return import("${escapeWinPath(path.join(process.cwd(), 'node_modules', master))}"); }`}, '${projectType}')`;
  } else {
    masterPathStr = `getMasters(${`function() { return import("${escapeWinPath(path.join(process.cwd(), master))}"); }`}, '${projectType}')`;
  }
  const dashboardPath = getDashBoardPath(configEntryName);
  const guidePath = getGuidePath(configEntryName);
  
  const routesPath = getRoutesPath(
    mainPackage,
    configEntryName,
    dashboardPath,
  );

  const entryPath = path.join(tmpDirPath, `entry.${configEntryName}.js`);
  const entryTemplate = fs.readFileSync(path.join(__dirname, '../../nunjucks/entry.nunjucks.js')).toString();
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      routesPath: escapeWinPath(routesPath),
      source: isDev ? 'src' : 'lib',
      guidePath: escapeWinPath(guidePath),
      master: masterPathStr,
      masterOutterPath: escapeWinPath(path.join(__dirname, `../../../${isDev ? 'src' : 'lib'}/containers/components/${isChoerodon ? 'c7n/master' : 'pro/masterPro'}`)),
    }),
  );
}
