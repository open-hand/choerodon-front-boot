import path from 'path';
import context from '../context';
import transformMain from './transformMain';

export default function getPackageRoute(packageInfo, base = '.') {
  const { choerodonConfig: { modules } } = context;
  if (packageInfo) {
    const { main, name, routeName } = packageInfo;
    const rName = routeName || name;
    const rMain = Array.isArray(modules) && modules.length > 0
      ? main
      : transformMain(main);
    
    return { [rName]: path.join(base, rMain) };
  }
}
