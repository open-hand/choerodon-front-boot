import fs from 'fs';
import getPackagePath from './getPackagePath';
import getPackageRoute from './getPackageRoute';
import context from './context';
import runCmd from './runCmd';

function install(done) {
  runCmd(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['i'], done);
}

function getDependenciesByModules(modules, dependencies) {
  const { choerodonConfig } = context;
  const deps = {};
  const routes = modules.reduce((obj, module) => {
    const packageInfo = require(getPackagePath(module));
    Object.assign(deps, packageInfo[dependencies]);
    return Object.assign(obj, getPackageRoute(packageInfo, module));
  }, {});

  if (!choerodonConfig.routes) {
    choerodonConfig.routes = routes;
  }
  return deps;
}

export default function installSubmoduleDependencies(program, cb) {
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);
  mainPackage.dependencies = Object.assign(getDependenciesByModules(program.args, 'dependencies'), mainPackage.dependencies);
  mainPackage.peerDependencies = Object.assign(getDependenciesByModules(program.args, 'peerDependencies'), mainPackage.peerDependencies);
  fs.writeFileSync(
    mainPackagePath,
    JSON.stringify(mainPackage),
  );
  install(() => cb(mainPackage));
}
