const path = require('path');
const gulp = require('gulp');
const rimraf = require('rimraf');
const babel = require('gulp-babel');
const through2 = require('through2');
const merge2 = require('merge2');

const cwd = process.cwd();
const libDir = path.join(cwd, 'lib');

function compileAssets() {
  return gulp.src(['src/**/*.@(jpg|png|svg|scss|less|html|ico|gif|css)']).pipe(gulp.dest(libDir));
}


function copyTo(dir) {
  rimraf.sync(dir);
  gulp.src('lib/**/*')
    .pipe(gulp.dest(dir));
}

function getBabelCommonConfig() {
  const plugins = [
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    ['@babel/plugin-proposal-decorators', {
      legacy: true,
    }],
    ['@babel/plugin-proposal-class-properties', {
      loose: true,
    }],
    ['babel-plugin-import',
      {
        libraryName: 'choerodon-ui',
        style: true,
      },
      'choerodon-ui',
    ], ['babel-plugin-import',
      {
        libraryName: 'choerodon-ui/pro',
        style: true,
      },
      'choerodon-ui-pro',
    ],
    'babel-plugin-lodash',
    ['babel-plugin-try-import', {
      tryImport: 'C7NTryImport',
      hasModule: 'C7NHasModule',
    }],
  ];
  return {
    presets: [
      '@babel/preset-react',
      '@babel/preset-env',
    ],
    plugins,
  };
}

function babelify(js, dir = '') {
  const babelConfig = getBabelCommonConfig();
  const stream = js.pipe(babel(babelConfig));
  return stream
    .pipe(through2.obj(function (file, encoding, next) {
      const matches = file.path.match(/(routes|dashboard|guide|entry)\.nunjucks\.(js|jsx)/);
      if (matches) {
        const content = file.contents.toString(encoding);
        file.contents = Buffer.from(content
          .replace(`'{{ ${matches[1]} }}'`, `{{ ${matches[1]} }}`)
          .replace('\'{{ home }}\'', '{{ home }}')
          .replace('\'{{ master }}\'', '{{ master }}'));
      }
      this.push(file);
      next();
    }))
    .pipe(gulp.dest(path.join(libDir, dir)));
}
function compileFile() {
  const source = [
    'src/**/*.js',
    'src/**/*.jsx',
  ];
  return babelify(gulp.src(source));
}
function compileDir(dir) {
  return babelify(gulp.src([
    `src/${dir}/**/*.js`,
    `src/${dir}/**/*.jsx`,
  ]), dir);
}

async function compileBin() {
  rimraf.sync(libDir);
  await compileDir('bin');
  await compileDir('common');
  await compileDir('config');
  await compileDir('nunjucks');
}


async function compile() {
  rimraf.sync(libDir);
  await compileAssets();
  await compileFile();
}
gulp.task('compile', () => compile());

gulp.task('compile-bin', () => compileBin());
gulp.task('copy', () => {
  copyTo('/Users/binjiechen/choerodon-front/node_modules/@choerodon/boot/lib');
});
