import axios from 'axios';
import { authorize } from '../../../common/authorize';
import { getAccessToken, removeAccessToken } from '../../../common/accessToken';
import { API_HOST } from '../../../common/constants';
import sessionExpiredLogin from '../../../common/sessionExpiredLogin';

const instance = axios.create({
  timeout: 30000,
  baseURL: API_HOST,
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
    const { status, headers, data } = response;
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
    if (data.success === false) {
      throw data;
    } else {
      return data;
    }
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

export default instance;
