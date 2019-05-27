import path from 'path';

export default function getPackageRoute(packageInfo, base = '.') {
  if (packageInfo) {
    const { main, name, routeName } = packageInfo;
    const rName = routeName || name;
    
    return { [rName]: path.join(base, main) };
  }
}
