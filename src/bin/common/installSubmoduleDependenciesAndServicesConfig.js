import path from 'path';
import context from './context';
import getPackagePath from './getPackagePath';
import getPackageRoute from './getPackageRoute';
import transformMain from './transformMain';

async function getDependenciesByModules(mainPackage) {
  const { choerodonConfig } = context;
  const routes = choerodonConfig.modules.reduce((obj, module) => {
    const packageInfo = require(getPackagePath(`./node_modules/${module}`));
    return Object.assign(obj, getPackageRoute(packageInfo, `./node_modules/${module}`));
  }, {});

  const { main, name, routeName } = mainPackage;
  if (main && main !== '') {
    const rName = routeName || name;
    const rMain = transformMain(main, 'lib', 'react');
    routes[rName] = path.join('.', main);
  }

  if (!choerodonConfig.routes) {
    choerodonConfig.routes = routes;
  }
}

export default async function installSubmoduleDependencies(cb) {
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);

  getDependenciesByModules(mainPackage);
  cb(mainPackage);
}
