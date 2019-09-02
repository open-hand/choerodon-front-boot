import path from 'path';
import fs from 'fs';
import spawn from 'cross-spawn';

const cwd = process.cwd();

export default function compile(program, dev) {
  let copy = false;
  const customGulpfilePath = path.join(cwd, 'gulpfile.js');
  const gulpfilePath = path.join(__dirname, './common/gulp/gulpfile.js');
  if (!fs.existsSync(customGulpfilePath)) {
    fs.copyFileSync(gulpfilePath, customGulpfilePath);
    copy = true;
  }
  const process = spawn('gulp', ['compile', '--gulpfile', path.join(cwd, 'gulpfile.js')], { stdio: 'inherit' });
  process.on('close', (code) => {
    if (copy) {
      try {
        fs.unlinkSync(customGulpfilePath);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('删除gulpfile.js失败，但这不会影响你的其他过程!');
      }
    }
    // eslint-disable-next-line no-console
    console.log('编译完成！');
  });
}
