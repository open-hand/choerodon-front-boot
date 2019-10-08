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

function compileFile() {
  return babelify(gulp.src([
    'src/**/*.js',
    'src/**/*.jsx',
  ]));
}

function compileBin(done) {
  rimraf.sync(libDir);
  merge2([
    compileDir('bin'),
    compileDir('common'),
    compileDir('config'),
    compileDir('nunjucks'),
  ]).on('finish', done);
}

function compileDir(dir) {
  return babelify(gulp.src([
    'src/' + dir + '/**/*.js',
    'src/' + dir + '/**/*.jsx',
  ]), dir);
}

function compile(done) {
  rimraf.sync(libDir);
  merge2([compileAssets(), compileFile()]).on('finish', done);
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
      [
        {
          'libraryName': 'choerodon-ui',
          'style': true,
        },
        {
          'libraryName': 'choerodon-ui/pro',
          'style': true,
        },
      ],
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
      const matches = file.path.match(/(routes|dashboard|guide|entry|entrywithoutsider)\.nunjucks\.(js|jsx)/);
      if (matches) {
        const content = file.contents.toString(encoding);
        file.contents = Buffer.from(content
          .replace(`'{{ ${matches[1]} }}'`, `{{ ${matches[1]} }}`)
          .replace(`'{{ home }}'`, '{{ home }}')
          .replace(`'{{ master }}'`, '{{ master }}'));
      }
      this.push(file);
      next();
    }))
    .pipe(gulp.dest(path.join(libDir, dir)));
}

gulp.task('compile', (done) => {
  compile(done);
});

gulp.task('compile-bin', (done) => {
  compileBin(done);
});
