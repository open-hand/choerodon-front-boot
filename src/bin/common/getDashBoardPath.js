import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import glob from 'glob';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import context from './context';


const dashboardTemplate = fs.readFileSync(path.join(__dirname, '../../nunjucks/dashboard.nunjucks.js')).toString();

function normalizeDashBoardComponentOrLocale(components, key, dir) {
  glob.sync(path.join(process.cwd(), dir)).forEach((match) => {
    components.push(`"${key}/${path.basename(match, path.extname(match))}": () => import("${match}"),`);
  });
}

function getDashBoards(dashboard) {
  const dashboardComponents = [];
  const dashboardLocale = [];
  if (isObject(dashboard)) {
    Object.keys(dashboard).forEach((key) => {
      const value = dashboard[key];
      let componentsPath = value;
      let localePath;
      if (isObject(value)) {
        componentsPath = value.components;
        localePath = value.locale;
      }
      if (typeof componentsPath === 'string') {
        normalizeDashBoardComponentOrLocale(dashboardComponents, key, componentsPath);
      } else if (isArray(componentsPath)) {
        componentsPath.forEach((dir) => {
          normalizeDashBoardComponentOrLocale(dashboardComponents, key, dir);
        });
      }
      if (typeof localePath === 'string') {
        normalizeDashBoardComponentOrLocale(dashboardLocale, key, localePath);
      }
    });
  }
  return `
{
  dashboardComponents: {
    ${dashboardComponents.join('\n    ')}
  },
  dashboardLocale: {
    ${dashboardLocale.join('\n    ')}
  }
}
  `;
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
