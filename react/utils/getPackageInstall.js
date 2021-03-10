import path from 'path';
import transformMain from './transformMain';

export default function getPackageInstall(packageInfo, base = '.') {
  if (packageInfo) {
    const { install } = packageInfo;
    if (!install) {
      return undefined;
    }
    const rMain = base !== '.'
      ? install
      : transformMain(install);

    return path.join(base !== '.' ? '/node_modules' : '', base, rMain);
  }
  return undefined;
}
