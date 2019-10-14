import path from 'path';

export default function getPackagePath(base = '.') {
  return path.join(process.cwd(), base !== '.' ? '/node_modules' : '', base, 'package.json');
}
