import { getCookie, removeCookie, setCookie } from './cookie';
import { ACCESS_DOMAIN, ACCESS_TOKEN, COOKIE_SERVER, LOCAL, TOKEN_TYPE } from './constants';

let cachedToken = null;

const localReg = /localhost/g;

export function getCookieToken() {
  const option = {
    path: '/',
  };
  const token = getCookie(ACCESS_TOKEN, option);
  if (token && cachedToken && token !== cachedToken) {
    return null;
  }
  return token;
}

/**
 * 前端存储cookie token
 */
export function setAccessToken(token, tokenType, expiresIn) {
  const option = {
    path: '/',
  };
  if (expiresIn) {
    const expires = expiresIn * 1000;
    option.expires = new Date(Date.now() + expires);
  }
  if (!LOCAL && !localReg.test(window.location.host) && getCookie(ACCESS_DOMAIN) === null) {
    option.domain = COOKIE_SERVER;
  }
  window.localStorage.removeItem('lastClosedId');
  setCookie(ACCESS_TOKEN, token, option);
  setCookie(TOKEN_TYPE, tokenType, option);
  cachedToken = token;
}

/**
 * 获取cookie token
 */
export function getAccessToken() {
  const option = {
    path: '/',
  };
  const accessToken = getCookieToken();
  const tokenType = getCookie(TOKEN_TYPE, option);
  if (accessToken && tokenType) {
    return `${tokenType} ${accessToken}`;
  }
  return null;
}

/**
 * 移除token
 */
export function removeAccessToken() {
  const option = {
    path: '/',
  };
  if (!LOCAL && !localReg.test(window.location.host)) {
    option.domain = COOKIE_SERVER;
  }
  removeCookie(ACCESS_TOKEN, option);
  removeCookie(TOKEN_TYPE, option);
}
