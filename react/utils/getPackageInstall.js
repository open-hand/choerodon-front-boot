import path from 'path';
import transformMain from './transformMain';

export default function getPackageInstall(packageInfo, base = '.') {
  if (packageInfo) {
    const { install } = packageInfo;
    const rMain = base !== '.'
      ? install
      : transformMain(install);

    return path.join(base !== '.' ? '/node_modules' : '', base, rMain);
  }
  return undefined;
}
