import context from './context';
import getPackagePath from './getPackagePath';
import getPackageRoute from './getPackageRoute';
import getPackageInstall from './getPackageInstall';

export default function handleCollectRoute() {
  const { choerodonConfig, choerodonConfig: { modules } } = context;
  const routes = modules.reduce((obj, module) => {
    const packageInfo = require(getPackagePath(module));
    return Object.assign(obj, getPackageRoute(packageInfo, module));
  }, {});
  if (!choerodonConfig.routes) {
    choerodonConfig.routes = routes;
  }
  const installs = modules.reduce((res, module) => {
    const packageInfo = require(getPackagePath(module));
    return [...res, getPackageInstall(packageInfo, module)];
  }, []).filter(Boolean);
  if (!choerodonConfig.installs) {
    choerodonConfig.installs = installs;
  }
}
