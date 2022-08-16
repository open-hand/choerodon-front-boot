import context from './context';
import getPackagePath from './getPackagePath';
import getPackageInstall from './getPackageInstall';

export default function handleCollectModules() {
  const { choerodonConfig, choerodonConfig: { modules } } = context;
  const installs = ['.'].reduce((res, module) => {
    const packageInfo = require(getPackagePath(module));
    return [...res, getPackageInstall(packageInfo, module)];
  }, []).filter(Boolean);

  if (!choerodonConfig.installs) {
    choerodonConfig.installs = installs;
  }
}
