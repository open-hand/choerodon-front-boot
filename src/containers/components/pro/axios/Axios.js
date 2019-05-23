import createAxiosInsByModuleName from '../../util/createAxiosInsByModuleName';

const instance = createAxiosInsByModuleName('SINGLE_APP_SERVER')();

export default instance;
