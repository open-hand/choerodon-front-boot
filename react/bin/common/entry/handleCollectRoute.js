import path from 'path';
import context from '../context';
import getPackagePath from '../utils/getPackagePath';
import getPackageRoute from '../utils/getPackageRoute';
import transformMain from '../utils/transformMain';

export default function handleCollectRoute() {
  const { choerodonConfig, choerodonConfig: { modules } } = context;
  const routes = modules.reduce((obj, module) => {
    const packageInfo = require(getPackagePath(module));
    return Object.assign(obj, getPackageRoute(packageInfo, module));
  }, {});
  if (!choerodonConfig.routes) {
    choerodonConfig.routes = routes;
  }
}
