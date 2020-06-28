import { isArray } from 'lodash';

const moduleDefaultExport = (module) => module.default || module;

export default function esModule(module) {
  if (isArray(module)) {
    return module.map(moduleDefaultExport);
  }
  return moduleDefaultExport(module);
}
