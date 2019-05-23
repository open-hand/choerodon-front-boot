import path from 'path';
import spawn from 'cross-spawn';

export default function start(program, dev) {
  const process = spawn('npm', ['run', 'compile'], { stdio: 'inherit' });
  process.on('close', (code) => {
    // 编译完成
  });
}
