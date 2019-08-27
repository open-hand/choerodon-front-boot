import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import context from './context';
import escapeWinPath from './utils/escapeWinPath';
import getPackageRoute from './utils/getPackageRoute';

const routesTemplate = fs.readFileSync(path.join(__dirname, '../../nunjucks/routes.nunjucks.js')).toString();

export default function handleGenerateRoute(packageInfo, configEntryName) {
  const { tmpDirPath, isDev, choerodonConfig: { routes, homePath } } = context;
  const configRoutes = routes || getPackageRoute(packageInfo);
  const routesPath = path.join(tmpDirPath, `routes.${configEntryName}.js`);
  nunjucks.configure(routesPath, {
    autoescape: false,
  });
  const homePathStr = `createHome("/", ${homePath ? `function() { return import("${escapeWinPath(path.join(process.cwd(), homePath || ''))}"); }` : null}, ${homePath ? `'${homePath}'` : homePath})`;
  fs.writeFileSync(
    routesPath,
    nunjucks.renderString(routesTemplate, {
      routes: Object.keys(configRoutes).map(key => (
        `createRoute("/${key}", function() { return import("${escapeWinPath(path.join(process.cwd(), configRoutes[key]))}"); }, "${key}")`
      )).join(',\n'),
      home: homePathStr,
      source: isDev ? 'src' : 'lib',
    }),
  );
  return routesPath;
}
