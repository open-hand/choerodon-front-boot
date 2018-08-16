import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import glob from 'glob';
import context from './context';


const dashboardTemplate = fs.readFileSync(path.join(__dirname, '../../nunjucks/dashboard.nunjucks.js')).toString();

function getDashBoardComponents(namespace, dir) {
  return glob.sync(path.join(process.cwd(), dir)).map(f => (
    `"${namespace}/${path.basename(f, path.extname(f))}": () => import("${f}"),`
  ));
}

function getDashBoards(dashboard) {
  const data = [];
  if (dashboard) {
    Object.keys(dashboard).forEach((key) => {
      [].concat(dashboard[key]).forEach((dir) => {
        data.push(...getDashBoardComponents(key, dir));
      });
    });
  }
  return `{\n${data.join('\n')}\n}`;
}

export default function getDashBoardPath(configEntryName) {
  const { choerodonConfig: { dashboard }, tmpDirPath } = context;
  const dashboardPath = path.join(tmpDirPath, `dashboard.${configEntryName}.js`);
  nunjucks.configure(dashboardPath, {
    autoescape: false,
  });
  fs.writeFileSync(
    dashboardPath,
    nunjucks.renderString(dashboardTemplate, {
      dashboard: getDashBoards(dashboard),
    }),
  );
  return dashboardPath;
}
