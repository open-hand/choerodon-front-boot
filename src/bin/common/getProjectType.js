import get from 'lodash/get';
import getPackagePath from './getPackagePath';
import context from './context';

/**
 * get project type and buildTye from package.json
 * default value: {
 *  isChoerodon: true,
 *  projectType: 'choerodon',
 *  isSingle: true,
 *  buildType: 'single',
 * }
 */
export default function getProjectType() {
  const { choerodonConfig: { projectType, buildType } } = context;
  return {
    isChoerodon: projectType === 'choerodon',
    projectType,
    isSingle: buildType === 'single',
    buildType,
  };
}
