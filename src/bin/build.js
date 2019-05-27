import webpack from 'webpack';
import path from 'path';
import fs from 'fs-extra';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import context from './common/context';
import warning from '../common/warning';
import initialize from './common/initialize';
import getVenderName from './common/getAllFiles';
import getPackagePath from './common/getPackagePath';
import generateEntryFile from './common/generateEntryFile';
import updateWebpackConfig from '../config/updateWebpackConfig';
import installSubmoduleDependencies from './common/installSubmoduleDependenciesAndServicesConfig';

function transformVendor() {
  const { choerodonConfig: { output, distBasePath } } = context;

  const venderName = getVenderName();
  if (venderName !== '') {
    const venderPath = path.join(process.cwd(), distBasePath, output, 'dis', venderName);
    const venderStr = fs.readFileSync(venderPath, { encoding: 'utf-8' });
    fs.writeFileSync(venderPath, venderStr.replace(/dis/g, 'lib/dist/dis'));
  }
}

function copyAndTransform(name = 'index.html') {
  const { choerodonConfig: { output, distBasePath, htmlPath } } = context;

  const htmlDistPath = path.join(process.cwd(), distBasePath, output, name);
  const dest = path.join(process.cwd(), htmlPath, name);

  fs.copySync(htmlDistPath, dest);

  const str = fs.readFileSync(dest, { encoding: 'utf-8' });
  const transformStr = str
    .replace(/href="\/dis/g, 'href="/lib/dist/dis')
    .replace(/src="\/dis/g, 'src="/lib/dist/dis')
    .replace(/\/favicon/g, '/lib/dist/favicon');
  fs.writeFileSync(dest, transformStr);

  fs.unlink(htmlDistPath);
}

/**
 * 编译完成后，由于单体应用的特征
 * 把index.html和withoutsider.html复制到其他目录下
 * 对vender中的url进行修改
 */
function handleAfterCompile() {
  copyAndTransform();
  copyAndTransform('withoutsider.html');
  transformVendor();
}

function dist(mainPackage, env) {
  const { choerodonConfig: { entryName, output, distBasePath } } = context;
  const distPath = path.join(process.cwd(), distBasePath, output);
  rimraf.sync(distPath);
  mkdirp.sync(distPath);

  generateEntryFile(
    mainPackage,
    entryName,
  );
  
  const webpackConfig = updateWebpackConfig('build', env);
  webpackConfig.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
  }));

  webpack(webpackConfig, (err, stats) => {
    if (err !== null) {
      warning(false, err);
    } else if (stats.hasErrors()) {
      warning(false, stats.toString('errors-only'));
    }

    handleAfterCompile();
  });
}

export default function build(program) {
  initialize(program);
  const env = program.env || process.env.NODE_ENV || 'production';
  const { choerodonConfig: { modules } } = context;
  if (Array.isArray(modules) && modules.length > 0) {
    installSubmoduleDependencies(mainPackage => dist(mainPackage, env));
  } else {
    const mainPackagePath = getPackagePath();
    const mainPackage = require(mainPackagePath);
    dist(mainPackage, env);
  }
}
