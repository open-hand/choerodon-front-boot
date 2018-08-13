/**
 * Created by smilesoul on 2017/6/23.
 */
import axios from 'axios';
import { authorize } from '../../common/authorize';
import { getAccessToken, removeAccessToken } from '../../common/accessToken';

// axios 配置
axios.defaults.timeout = 30000;
axios.defaults.baseURL = `${process.env.API_HOST}`;

// history.go(0);
// http request 拦截器);
axios.interceptors.request.use(
  (config) => {
    const newConfig = config;
    newConfig.headers['Content-Type'] = 'application/json';
    // newConfig.headers['If-Modified-Since'] = new Date();
    // newConfig.headers['Cache-Control'] = 'max-age=3600';
    newConfig.headers.Accept = 'application/json';
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

// http response 拦截器
axios.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return Promise.resolve(response);
    }
    // continue sending response to the then() method
    return Promise.resolve(response.data);
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
    return Promise.reject(error);
  },
);

export default axios;
