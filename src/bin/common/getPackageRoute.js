import path from 'path';

export default function getPackageRoute(packageInfo, base = '.') {
  if (packageInfo) {
    const { main, name } = packageInfo;
    return { [name.slice(name.lastIndexOf('-') + 1)]: path.join(base, main) };
  }
}
