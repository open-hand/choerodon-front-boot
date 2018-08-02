'use strict';

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

function compileFile(type) {
  const source = [];
  if (!type || type === 'js') {
    source.push('src/**/*.js');
  }
  if (!type || type === 'jsx') {
    source.push('src/**/*.jsx');
  }
  return babelify(gulp.src(source));
}

function compile() {
  rimraf.sync(libDir);
  const assets = compileAssets();
  const jsFilesStream = compileFile();
  // return merge2([jsFilesStream, assets]);
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

function babelify(js) {
  const babelConfig = getBabelCommonConfig();
  const stream = js.pipe(babel(babelConfig));
  return stream
    .pipe(through2.obj(function (file, encoding, next) {
      const matches = file.path.match(/(routes|dashboard)\.nunjucks\.js/);
      if (matches) {
        const content = file.contents.toString(encoding);
        file.contents = Buffer.from(content
          .replace(`'{{ ${matches[1]} }}'`, `{{ ${matches[1]} }}`));
      }
      this.push(file);
      next();
    }))
    .pipe(gulp.dest(libDir));
}

gulp.task('compile', () => {
  compile();
});

gulp.task('compileJs', () => {
  compileFile('js');
});

gulp.task('compileJsx', () => {
  compileFile('jsx');
});

gulp.task('compileAssets', () => {
  compileAssets();
});

gulp.task('watch', () => {
  gulp.watch(path.join(__dirname, 'src/**/*.js'), ['compileJs']);
  gulp.watch(path.join(__dirname, 'src/**/*.jsx'), ['compileJsx']);
  gulp.watch(path.join(__dirname, 'src/**/*.@(jpg|png|svg|scss|html|ico)'), ['compileAssets']);
});
