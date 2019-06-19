import path from 'path';
import transformMain from './transformMain';

export default function getPackageRoute(packageInfo, base = '.') {
  if (packageInfo) {
    const { main, name, routeName } = packageInfo;
    const rName = routeName || name;
    const rMain = transformMain(main, 'lib', 'react');
    
    return { [rName]: path.join(base, main) };
  }
}
