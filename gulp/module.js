

const path = require('path');
const gulp = require('gulp');
const conf = require('./config');
const merge = require('merge-stream');
const changeCase = require('change-case');
const debug = require('gulp-debug');
const template = require('gulp-template');
const fs = require('fs');
const foreach = require('gulp-foreach');
const newer = require('gulp-newer');
const del = require('del');
const runSequence = require('run-sequence');
const glob = require('glob');
const UrlPattern = require('url-pattern');
const nunjucksRender = require('gulp-nunjucks-api');

const files = fs.readdirSync('../');
// 拿到根目录的文件名
const proModule = files.filter(value => value[0] !== '.');
// const Module = files.map((value) => {
//   if (value.split('_')[0] == 'Front') {
//     return value;
//   }
// });
// console.log(Module);

// 读取当前项目的父目录下除了boot的模块
const moduleFolders = fs.readdirSync(path.join(conf.paths.src, '../..'))
  .filter(file => file != 'boot' && proModule.indexOf(file) > -1 && file.indexOf('.') < 0 && fs.statSync(path.join(conf.paths.src, '../..', file)).isDirectory() && fs.existsSync(path.join(conf.paths.src, '../..', file, 'package.json')));
conf.paths.modules = moduleFolders;

// 将各模块app目录下的文件拷贝到src/app下

gulp.task('sync', () => {
  const syncTasks = conf.paths.modules.map(mod => gulp.src(path.join('../', mod, 'src/app/', mod, '/**/*'))
    .pipe(newer(path.join(conf.paths.src, 'app', changeCase.lowerCase(mod))))
    .pipe(debug({
      title: 'copy file:',
    })).pipe(gulp.dest(path.join(conf.paths.src, 'app', changeCase.lowerCase(mod)))));
  return merge(syncTasks);
});

// 生成src/app/generate/store.js文件
gulp.task('generateStoresFile', () => {
  const pattern = new UrlPattern('src/containers/stores/:filename.js');
  conf.paths.taskVars.imports = [];
  conf.paths.taskVars.defines = [];

  glob.sync(path.join('./src/containers/stores/*.js')).map((file) => {
    const match = pattern.match(file);
    conf.paths.taskVars.imports.push(`import ${match.filename} from ` + `'../../containers/stores/${match.filename}';`);
    conf.paths.taskVars.defines.push(`${match.filename}:${match.filename}`);
  });
  gulp.src('./templates/stores.js')
    .pipe(nunjucksRender({
      extension: 'inherit',
      autoescape: false,
      data: {
        imports: conf.paths.taskVars.imports.join('\n'),
        defines: conf.paths.taskVars.defines.join(','),
      },
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, 'app/generate')));
});

// 监听相应的文件变动，自动更新文件
gulp.task('watchForGenerateFile', () => {
  gulp.watch(path.join('./templates/stores.js'), () => {
    gulp.start('generateStoresFile');
  });

  const watcher = gulp.watch(path.join('./src/app/*/stores/globalStores/*.js'), () => {
    gulp.start('generateStoresFile');
  });
  watcher.on('change', (ev) => {
    if (ev.type === 'deleted') {
      gulp.start('generateStoresFile');
    }
  });

  return gulp.watch(path.join('./templates/AutoRouter.js'), () => {
    gulp.start('generateAutoRouterFile');
  });
});

// 监听相应的文件变动，自动更新文件
gulp.task('generateFile', () => {
  gulp.start('generateStoresFile');
  gulp.start('generateAutoRouterFile');
  gulp.start('generateRouteMap');
  gulp.start('generateIcons');
  gulp.start('generatePermission');
});

// 生成src/app/generate/AutoRouter.js文件
gulp.task('generateAutoRouterFile', () => {
  conf.paths.taskVars.routes = [];
  conf.paths.taskVars.asyncRoutes = [];
  conf.paths.modules.map((mod) => {
    const IndexName = `${changeCase.upperCase(mod)}Index`;
    conf.paths.taskVars.routes.push(`<Route path='/${changeCase.lowerCase(mod)}' component={${IndexName}}/>`);
    conf.paths.taskVars.asyncRoutes.push(`const ${IndexName} = asyncRouter(() => import('../${changeCase.lowerCase(mod)}/containers/${IndexName}'))`);
  });
  gulp.src('./templates/AutoRouter.js')
    .pipe(nunjucksRender({
      extension: 'inherit',
      autoescape: false,
      data: {
        routes: conf.paths.taskVars.routes.join('\n'),
        asyncRoutes: conf.paths.taskVars.asyncRoutes.join('\n'),
      },
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, 'app/generate')));
});

// 生成src/app/generate/RouteMap.js 文件
gulp.task('generateRouteMap', () => {
  const pattern = new UrlPattern('src/app/:module/common/:filename.js');
  conf.paths.taskVars.imports = [];
  conf.paths.taskVars.defines = [];
  glob.sync(path.join('./src/app/*/common/RouteMap.js')).map((file) => {
    const match = pattern.match(file);
    conf.paths.taskVars.imports.push(`import ${match.module} from ` + `'../${match.module}/common/RouteMap';`);
    conf.paths.taskVars.defines.push(match.module);
  });
  gulp.src('./templates/RouteMap.js')
    .pipe(nunjucksRender({
      extension: 'inherit',
      autoescape: false,
      data: {
        imports: conf.paths.taskVars.imports.join('\n'),
        defines: conf.paths.taskVars.defines.join(','),
      },
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, 'app/generate')));
});

// 生成src/app/generate/Icon.js 文件
gulp.task('generateIcons', () => {
  const pattern = new UrlPattern('src/app/:module/common/:filename.js');
  conf.paths.taskVars.imports = [];
  conf.paths.taskVars.defines = [];
  glob.sync(path.join('./src/app/*/common/Icons.js')).map((file) => {
    const match = pattern.match(file);
    conf.paths.taskVars.imports.push(`import ${match.module} from ` + `'../${match.module}/common/Icons';`);
    conf.paths.taskVars.defines.push(match.module);
  });
  gulp.src('./templates/Icons.js')
    .pipe(nunjucksRender({
      extension: 'inherit',
      autoescape: false,
      data: {
        imports: conf.paths.taskVars.imports.join('\n'),
        defines: conf.paths.taskVars.defines.join(','),
      },
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, 'app/generate')));
});

// 生成src/app/generate/Permission.js 文件

gulp.task('generatePermission', () => {
  const pattern = new UrlPattern('src/app/:module/common/:filename.js');
  conf.paths.taskVars.imports = [];
  conf.paths.taskVars.defines = [];
  glob.sync(path.join('./src/app/*/common/Permission.js')).map((file) => {
    const match = pattern.match(file);
    conf.paths.taskVars.imports.push(`import ${match.module} from ` + `'../${match.module}/common/Permission';`);
    conf.paths.taskVars.defines.push(match.module);
  });
  gulp.src('./templates/Permission.js')
    .pipe(nunjucksRender({
      extension: 'inherit',
      autoescape: false,
      data: {
        imports: conf.paths.taskVars.imports.join('\n'),
        defines: conf.paths.taskVars.defines.join(','),
      },
    }))
    .pipe(gulp.dest(path.join(conf.paths.src, 'app/generate')));
});

// 按模块监听文件变动
gulp.task('watch', () => {
  conf.paths.modules.map((mod) => {
    const watcher = gulp.watch(path.join('../', mod, 'src/**/*.*'), () => {
      gulp.src(path.join('../', mod, 'src/app/', mod, '/**/*'))
        .pipe(newer(path.join(conf.paths.src, 'app', changeCase.lowerCase(mod))))
        .pipe(debug({
          title: 'copy file:',
        })).pipe(gulp.dest(path.join(conf.paths.src, 'app', changeCase.lowerCase(mod))));
    });
    watcher.on('change', (ev) => {
      if (ev.type === 'deleted') {
        del(path.relative('../', ev.path).replace(path.join(mod, '/src/app'), path.join(conf.paths.src, '/app')));
      }
    });
  });
});

gulp.task('run', () => {
  runSequence('sync', 'watchForGenerateFile', 'generateFile', 'watch');
});

gulp.task('clean', () => {
  del([path.join(conf.paths.src, '/app')]);
});

gulp.task('start', () => {
  runSequence('sync', 'generateFile');
});
