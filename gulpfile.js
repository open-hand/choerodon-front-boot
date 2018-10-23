

const path = require('path');
const gulp = require('gulp');
const rimraf = require('rimraf');
const babel = require('gulp-babel');
const through2 = require('through2');
const merge2 = require('merge2');

const cwd = process.cwd();
const libDir = path.join(cwd, 'lib');

function compileAssets() {
  return gulp.src(['src/**/*.@(jpg|png|svg|scss|html|ico)']).pipe(gulp.dest(libDir));
}

function compileFile() {
  const source = [
    'src/**/*.js',
    'src/**/*.jsx',
  ];
  return babelify(gulp.src(source));
}

function compileBin() {
  rimraf.sync(libDir);
  compileDir('bin');
  compileDir('common');
  compileDir('config');
  compileDir('nunjucks');
}

function compileDir(dir) {
  babelify(gulp.src([
    'src/' + dir + '/**/*.js',
    'src/' + dir + '/**/*.jsx',
  ]), dir);
}

function compile() {
  rimraf.sync(libDir);
  compileAssets();
  compileFile();
}

function copyTo(dir) {
  rimraf.sync(dir);
  gulp.src('lib/**/*')
    .pipe(gulp.dest(dir));
}

function getBabelCommonConfig() {
  const plugins = [
    require.resolve('babel-plugin-syntax-dynamic-import'),
    require.resolve('babel-plugin-transform-decorators-legacy'),
    require.resolve('babel-plugin-transform-es3-member-expression-literals'),
    require.resolve('babel-plugin-transform-es3-property-literals'),
    require.resolve('babel-plugin-transform-object-assign'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    [require.resolve('babel-plugin-transform-runtime'), {
      polyfill: false,
    }],
    [
      require.resolve('babel-plugin-import'),
      {
        'libraryName': 'choerodon-ui',
        'style': true,
      },
    ],
    require.resolve('babel-plugin-lodash'),
  ];
  return {
    presets: [
      require.resolve('babel-preset-react'),
      require.resolve('babel-preset-es2015'),
      require.resolve('babel-preset-stage-1'),
    ],
    plugins,
  };
}

function babelify(js, dir = '') {
  const babelConfig = getBabelCommonConfig();
  const stream = js.pipe(babel(babelConfig));
  return stream
    .pipe(through2.obj(function (file, encoding, next) {
      const matches = file.path.match(/(routes|dashboard|guide)\.nunjucks\.(js|jsx)/);
      if (matches) {
        const content = file.contents.toString(encoding);
        file.contents = Buffer.from(content
          .replace(`'{{ ${matches[1]} }}'`, `{{ ${matches[1]} }}`));
      }
      this.push(file);
      next();
    }))
    .pipe(gulp.dest(path.join(libDir, dir)));
}

gulp.task('compile', () => {
  compile();
});

gulp.task('compile-bin', () => {
  compileBin();
});

gulp.task('copy', () => {
  copyTo('/Users/binjiechen/choerodon-front-iam/iam/node_modules/choerodon-front-boot/lib');
});
