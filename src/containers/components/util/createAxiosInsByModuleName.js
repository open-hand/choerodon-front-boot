import axios from 'axios';
import get from 'lodash/get';
import { authorize } from '../../common/authorize';
import { getAccessToken, removeAccessToken } from '../../common/accessToken';
import { API_HOST } from '../../common/constants';
import sessionExpiredLogin from '../../common/sessionExpiredLogin';
import { SERVICES_CONFIG } from '../../common/constants';

const MODULE_SERVER_LINK_MAP = SERVICES_CONFIG === '' ? [] : JSON.parse(SERVICES_CONFIG);
const AXIOS_INSTANCE_MAP = {};
const SINGLE_APP_SERVER = 'SINGLE_APP_SERVER';

function getServerByModule(moduleName) {
  let server = SINGLE_APP_SERVER;
  for (let i = 0; i < MODULE_SERVER_LINK_MAP.length; i += 1) {
    const modules = get(MODULE_SERVER_LINK_MAP, [i, 'services', 'modules']);
    if (Array.isArray(modules) && modules.includes(moduleName)) {
      server = get(MODULE_SERVER_LINK_MAP, [i, 'services', 'name']);
      break;
    }
  }
  return server;
}

function getNearsetServer(module, server, targetModule) {
  const serviceObj = MODULE_SERVER_LINK_MAP.find(s => s.services.name === server);
  if (serviceObj && Array.isArray(serviceObj.modules) && serviceObj.modules.includes(targetModule)) {
    return server;
  }
  return getServerByModule(targetModule);
}

function getKeyByModuleAndServer(module, server) {
  return `KEY:${server}`;
}

function getPrefixByServer(server) {
  const services = MODULE_SERVER_LINK_MAP.find(service => service.services.name === server);
  if (services) {
    return services.services.prefix;
  }
}

function createAxiosInstance(module, server) {
  const prefix = getPrefixByServer(server);
  const instance = axios.create({
    timeout: 30000,
    baseURL: prefix && server !== SINGLE_APP_SERVER ? `${API_HOST}/${prefix}` : API_HOST,
  });
  
  let CSRF_TOKEN;
  
  instance.interceptors.request.use(
    (config) => {
      const newConfig = config;
      newConfig.headers['Content-Type'] = 'application/json';
      newConfig.headers['X-Requested-With'] = 'XMLHttpRequest';
      newConfig.headers.Accept = 'application/json';
      if (CSRF_TOKEN) {
        newConfig.headers['x-csrf-token'] = CSRF_TOKEN;
      }
      const accessToken = getAccessToken();
      if (accessToken) {
        newConfig.headers.Authorization = accessToken;
      }
      return newConfig;
    },
    (err) => {
      const error = err;
      return Promise.reject(error);
    },
  );
  
  instance.interceptors.response.use(
    (response) => {
      const { status, headers } = response;
      if (!CSRF_TOKEN && headers['x-csrf-token']) {
        CSRF_TOKEN = headers['x-csrf-token'];
      }
      if (
        status === 200
        && response.request.responseURL
        && (response.request.responseURL.endsWith('login'))
      ) {
        authorize();
        return Promise.reject(new Error('need login'));
      }
      if (
        status === 200
        && response.data
        && !response.data.success
        && response.data.code === 'sys_session_timeout'
      ) {
        // 弹窗警告登录失效
        sessionExpiredLogin();
      }
      if (status === 204) {
        return response;
      }
      return response.data;
    },
    (error) => {
      const { response } = error;
      if (response) {
        const { status } = response;
        switch (status) {
          case 401: {
            removeAccessToken();
            authorize();
            break;
          }
          default:
            break;
        }
      }
      throw error;
    },
  );
  
  return instance;
}

function getAxiosInstance(module, server) {
  const moduleServerKey = getKeyByModuleAndServer(module, server);
  if (AXIOS_INSTANCE_MAP[moduleServerKey]) {
    return AXIOS_INSTANCE_MAP[moduleServerKey];
  }
  const instance = createAxiosInstance(module, server);
  AXIOS_INSTANCE_MAP[moduleServerKey] = instance;
  return instance;
}

function getAxios(module) {
  const server = getServerByModule(module);
  // eslint-disable-next-line func-names
  return function (targetModule = null) {
    const finalModule = targetModule || module;
    let finalServer;
    if (!targetModule) {
      finalServer = server;
    } else {
      finalServer = getNearsetServer(module, server, targetModule);
    }
    const axiosInstance = getAxiosInstance(finalModule, finalServer);
    return axiosInstance;
  };
}

export default getAxios;
