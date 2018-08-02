/*eslint-disable*/
import React from 'react';
import Cookies from 'universal-cookie';
import { message } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import url from 'url';
import AppState from '../stores/AppState';

const cookies = new Cookies();
const ACCESS_TOKEN = 'access_token';
const TOKEN_TYPE = 'token_type';
const ACCESS_DOMAIN = 'domain';
const AUTH_URL = `${process.env.AUTH_HOST}/oauth/authorize?response_type=token&client_id=${process.env.CLIENT_ID}&state=`;
const LOCAL = JSON.parse(process.env.LOCAL || 'true');
const COOKIE_SERVER = process.env.COOKIE_SERVER;
const FILE_SERVER = process.env.FILE_SERVER;
const USE_DASHBOARD = JSON.parse(process.env.USE_DASHBOARD || 'false');

const localReg = /localhost/g;

const setCookie = (name, value, option) => cookies.set(name, value, option);

const getCookie = (name, option) => cookies.get(name, option);

const removeCookie = (name, option) => cookies.remove(name, option);

function checkPassword(passwordPolicy, value, callback, userName) {
  if (passwordPolicy) {
    const check = passwordPolicy.enablePassword;
    const minLength = passwordPolicy.minLength;
    const maxLength = passwordPolicy.maxLength;
    const upcount = passwordPolicy.uppercaseCount;
    const spcount = passwordPolicy.specialCharCount;
    const lowcount = passwordPolicy.lowercaseCount;
    const notEqualsUsername = passwordPolicy.notUsername;
    const regexCheck = passwordPolicy.regularExpression;
    if (value && (check)) {
      let len = 0;
      let rs = '';
      let sp;
      let up = 0;
      let low = 0;
      for (let i = 0; i < value.length; i += 1) {
        const a = value.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) {
          len += 2;
        } else {
          len += 1;
        }
      }
      const pattern = new RegExp('[`~!@#$^&*()=%|{}\':;\',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“\'。，、？]');
      for (let i = 0; i < value.length; i += 1) {
        rs += value.substr(i, 1).replace(pattern, '');
        sp = value.length - rs.length;
      }
      if (/[A-Z]/i.test(value)) {
        const ups = value.match(/[A-Z]/g);
        up = ups ? ups.length : 0;
      }
      if (/[a-z]/i.test(value)) {
        const lows = value.match(/[a-z]/g);
        low = lows ? lows.length : 0;
      }
      if (minLength && (len < minLength)) {
        callback(getMessage(`密码长度至少为${minLength}`, `Password length is at least ${minLength}`));
        return;
      }
      if (maxLength && (len > maxLength)) {
        callback(getMessage(`密码长度最多为${maxLength}`, `Password length is upto ${maxLength}`));
        return;
      }
      if (upcount && (up < upcount)) {
        callback(getMessage(`大写字母至少为${upcount}`, `At least for a capital letter ${upcount}`));
        return;
      }
      if (lowcount && (low < lowcount)) {
        callback(getMessage(`小写字母至少为${lowcount}`, `At least for a lower-case letters ${lowcount}`));
        return;
      }
      if (notEqualsUsername && value === userName) {
        callback(getMessage('密码不能与账号相同', 'password can not equal with the userName'));
        return;
      }
      if (regexCheck) {
        const regex = new RegExp(regexCheck);
        if (regex.test(value)) {
          callback();
        } else {
          callback(getMessage('正则不匹配', 'can not test regex'));
        }
      }
      if (spcount && (sp < spcount)) {
        callback(getMessage(`特殊字符至少为${spcount}`, `At least for special characters ${spcount}`));
      } else {
        callback();
      }
    } else {
      callback();
    }
  } else {
    callback();
  }
}

let cachedToken = null;

function getCookieToken() {
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
function setAccessToken(token, token_type, expires_in) {
  const option = {
    path: '/',
  };
  if (expires_in) {
    const expires = expires_in * 1000;
    option.expires = new Date(Date.now() + expires);
  }
  if (!LOCAL && !localReg.test(window.location.host) &&
    getCookie(ACCESS_DOMAIN) === null) {
    option.domain = COOKIE_SERVER;
  }
  setCookie(ACCESS_TOKEN, token, option);
  setCookie(TOKEN_TYPE, token_type, option);
  cachedToken = token;
}

/**
 * 获取cookie token
 */
function getAccessToken() {
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
function removeAccessToken() {
  const option = {
    path: '/',
  };
  if (!LOCAL && !localReg.test(window.location.host)) {
    option.domain = COOKIE_SERVER;
  }
  removeCookie(ACCESS_TOKEN, option);
  removeCookie(TOKEN_TYPE, option);
}

/**
 * @deprecated
 * 多语言
 */
function languageChange(id, otherProps) {
  return <FormattedMessage id={`${id}`} {...otherProps} />;
}

/**
 * 多语言
 */
function intl(id, otherProps) {
  return <FormattedMessage id={id} {...otherProps} />;
}

/**
 * 登出
 */
function logout() {
  const token = getCookieToken();
  let logoutUrl = `${process.env.AUTH_HOST}/logout`;
  if (token) {
    logoutUrl += `?${ACCESS_TOKEN}=${getCookieToken()}`;
  }
  removeAccessToken();
  localStorage.clear();
  sessionStorage.clear();
  window.location = logoutUrl;
}

// 返回多语言字符串
function getMessage(zh, en) {
  const language = AppState.currentLanguage.split('_')[0];
  if (language === 'zh') {
    return zh;
  } else if (language === 'en') {
    return en;
  }
  return false;
}


// 提示错误信息
function prompt(content, type = 'info', duration, placement = 'leftBottom', onClose) {
  const messageType = ['success', 'error', 'info', 'warning', 'warn', 'loading'];
  if (messageType.indexOf(type) !== -1) {
    message[type](content, duration, onClose, placement);
  }
}

// 处理错误相应
function handleResponseError(error) {
  const response = error.response;
  if (response) {
    const status = response.status;
    switch (status) {
      case 400: {
        const mess = response.data.message;
        message.error(mess);
        break;
      }
      default:
        break;
    }
  }
}

// 生成指定长度的随机字符串
function randomString(len = 32) {
  let code = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const maxPos = chars.length;
  for (let i = 0; i < len; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * (maxPos + 1)));
  }
  return code;
}

function historyPushMenu(history, path, domain, method = 'push') {
  if (!domain || LOCAL) {
    history[method](path);
  } else if (!path) {
    window.location = `${domain}`;
  } else {
    const reg = new RegExp(domain, 'g');
    if (reg.test(window.location.host)) {
      history[method](path);
    } else {
      window.location = `${domain}/#${path}`;
    }
  }
}

function historyReplaceMenu(history, path, uri) {
  historyPushMenu(history, path, uri, 'replace');
}

function fileServer(path) {
  return url.resolve(FILE_SERVER, path || '');
}

function authorize() {
  window.location = AUTH_URL;
}

export {
  ACCESS_TOKEN,
  AUTH_URL,
  fileServer,
  setCookie,
  getCookie,
  removeCookie,
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  languageChange,
  getMessage,
  logout,
  prompt,
  checkPassword,
  handleResponseError,
  randomString,
  historyPushMenu,
  historyReplaceMenu,
  authorize,
  USE_DASHBOARD as dashboard,
};
