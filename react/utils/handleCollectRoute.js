import context from './context';
import getPackagePath from './getPackagePath';
import getPackageRoute from './getPackageRoute';

export default function handleCollectRoute() {
  const { choerodonConfig, choerodonConfig: { modules } } = context;
  const routes = ['.'].reduce((obj, module) => {
    const packageInfo = require(getPackagePath(module));
    return Object.assign(obj, getPackageRoute(packageInfo, module));
  }, {});
  if (!choerodonConfig.routes) {
    choerodonConfig.routes = routes;
  }
}
