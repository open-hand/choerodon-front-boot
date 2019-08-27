import path from 'path';

export default function getPackagePath(base = '.') {
  return path.join(process.cwd(), base, 'package.json');
}
