var glob = require('glob');
var path = require('path');
var fs = require('fs');
var through2 = require('through2');

// gulp.src(path.join(process.cwd(), 'src/containers/components/dashboard/*'))
//   .pipe(through2.obj(function (file, encoding, next) {
//     console.log(path.basename(file.path));
//     // console.log(file.base, file.cwd, file.stat.isDirectory(), file.history);
//     this.push(file);
//     next();
//   }));

const files = glob.sync(path.join(process.cwd(), 'src/containers/components/dashboard/demo/*'));
for (let f of files) {
  console.log(f, path.basename(f, path.extname(f)));
}
