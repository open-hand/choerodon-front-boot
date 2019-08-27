import path from 'path';
import context from './context';
import getPackagePath from './utils/getPackagePath';
import getPackageRoute from './utils/getPackageRoute';
import transformMain from './utils/transformMain';

export default function handleCollectRoute(mainPackage) {
  const { choerodonConfig, choerodonConfig: { modules } } = context;

  const routes = modules.reduce((obj, module) => {
    const packageInfo = require(getPackagePath(`./node_modules/${module}`));
    return Object.assign(obj, getPackageRoute(packageInfo, `./node_modules/${module}`));
  }, {});

  const { main, name, routeName } = mainPackage;
  if (main && main !== '') {
    const rName = routeName || name;
    const rMain = transformMain(main);
    routes[rName] = path.join('.', rMain);
  }

  if (!choerodonConfig.routes) {
    choerodonConfig.routes = routes;
  }
}
