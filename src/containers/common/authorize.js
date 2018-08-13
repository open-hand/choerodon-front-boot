import { ACCESS_TOKEN, AUTH_HOST, AUTH_URL } from './constants';
import { getCookieToken, removeAccessToken } from './accessToken';

export function authorize() {
  window.location = AUTH_URL;
}

/**
 * 登出
 */
export function logout() {
  const token = getCookieToken();
  let logoutUrl = `${AUTH_HOST}/logout`;
  if (token) {
    logoutUrl += `?${ACCESS_TOKEN}=${getCookieToken()}`;
  }
  removeAccessToken();
  localStorage.clear();
  sessionStorage.clear();
  window.location = logoutUrl;
}
