/**
 * Created by tonngyang on 2017/6/23.
 */
/*eslint-disable*/
import React from 'react';
import { toJS } from 'mobx';
import Cookies from 'universal-cookie';
import { message } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import axios from 'Axios';
import config from 'Config';
import screenfull from 'screenfull';
import AppState from 'AppState';

const cookies = new Cookies();
// (!function () {
const ACCESS_TOKEN = 'access_token';
const ACCESS_DOMAIN = 'domain';
const AUTH_URL = `${process.env.AUTH_HOST}/oauth/authorize?response_type=token&client_id=${process.env.CLIENT_ID}&state=`;
let local;
let cookieServer;
const localReg = /localhost/g;
local = process.env.LOCAL || config.local;
// cookieServer = document.location.hostname || process.env.COOKIE_SERVER;
cookieServer = process.env.COOKIE_SERVER || config.cookieServer;
// if(JSON.parse(process.env.LOCAL) == true) {
//   local = process.env.LOCAL;
// } else {
//   local = false;
// }
const MenuCode = [];
const theme = config.themeSetting;

const setCookie = (name, value, option) => cookies.set(name, value, option);

// const getCookie = (name, value, option) => cookies.getALL(name,value,option);
function getCookie(sName) {
  var aCookie = document.cookie.split('; ');
  for (var i = 0; i < aCookie.length; i++) {
    var aCrumb = aCookie[i].split('=');
    if (sName == aCrumb[0])
      return unescape(aCrumb[1]);
  }
  return null;
}

const removeCookie = (name, value, option) => cookies.remove(name, value, option);
let permissionflag;
let permissionflagGlobal;

// 获取url token
function getAccessToken(hash) {
  if (hash) {
    const ai = hash.indexOf(ACCESS_TOKEN);
    if (ai !== -1) {
      const reg = /access_token=[0-9a-zA-Z-]*/g;
      hash.match(reg);
      const centerReg = hash.match(reg)[0];
      const accessToken = centerReg.split('=')[1];
      return accessToken;
    }
  }
  return null;
}

//页面进度完成
function nprogress(callback) {
  return () => {
    if (document.readyState && document.readyState == 'complete') {
      setTimeout(() => {
        callback();
      }, 100);
    } else {
      setTimeout(() => {
        callback();
      }, 100);
    }
  };
}

//全屏展示
function fullscreen(id = 'autoRouter') {
  const el = document.getElementById(id);
  // const position = el.style.position;
  // const widths = el.style.width;
  // document.addEventListener('keyup', (e) => {
  //   if (e.which === 27) {
  //     el.style.position = position;
  //     el.style.width = widths;
  //   }
  // })
  // document.addEventListener("fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange", function (e) {

  // });
  if (!screenfull.isFullscreen) {
    screenfull.request(el);
    // el.style.position = 'initial';
    // el.style.width = '100%';
    // document.addEventListener('keyup', (e) => {
    //   if (e.which === 27) {
    //     el.style.position = position;
    //     el.style.width = widths;
    //   }
    // })
  }
}

//权限获取
function permissonGet(Permission) {
  if (AppState.currentMenuType) {
    if (sessionStorage.type === 'global') {
      let permissionDataOrg1;
      let permissionDataPro1;
      const permissionDataArray1 = [];
      const arrayCenter1 = [];
      const type1 = 'global';
      permissionDataPro1 = {
        resourceType: 'global',
      };
      permissionDataArray1.push(permissionDataPro1);
      Object.keys(Permission).forEach((i) => {
        Permission[i].map((value) => {
          permissionDataArray1.map((permissionDatas) => {
            let permissionObj1 = {};
            const permissionData1 = permissionDatas;
            permissionData1.name = value;
            permissionData1.menu = i;
            permissionObj1 = _.cloneDeep(permissionData1);
            arrayCenter1.push(permissionObj1);
            return null;
          });
          return null;
        });
        return null;
      });
      const uniqarrayCenter1 = _.uniqWith(arrayCenter1, _.isEqual);
      if (permissionflagGlobal) {
        if (_.isEqual(permissionflagGlobal, uniqarrayCenter1)) {
        } else {
          axios.post('/iam/v1/permissions/testPermission', JSON.stringify(uniqarrayCenter1))
            .then((data) => {
              AppState.setPerMission(data);
            });
        }
      } else {
        permissionflagGlobal = uniqarrayCenter1;
        axios.post('/iam/v1/permissions/testPermission', JSON.stringify(uniqarrayCenter1))
          .then((data) => {
            AppState.setPerMission(data);
          });
      }
    }
    else {
      let permissionDataOrg;
      let permissionDataPro;
      const permissionDataArray = [];
      const arrayCenter = [];
      const type = AppState.currentMenuType.type;
      if (type === 'organization') {
        const orgId = AppState.currentMenuType.id;
        permissionDataOrg = {
          resourceId: orgId,
          resourceType: 'organization',
          organizationId: orgId,
        };
        permissionDataArray.push(permissionDataOrg);
      } else if (type === 'project') {
        const proId = AppState.currentMenuType.id;
        const organizationId = AppState.currentMenuType.organizationId;
        permissionDataPro = {
          resourceId: proId,
          resourceType: 'project',
          organizationId,
        };
        permissionDataArray.push(permissionDataPro);
      }
      Object.keys(Permission).forEach((i) => {
        Permission[i].map((value) => {
          permissionDataArray.map((permissionDatas) => {
            let permissionObj = {};
            const permissionData = permissionDatas;
            permissionData.name = value;
            permissionData.menu = i;
            permissionObj = _.cloneDeep(permissionData);
            arrayCenter.push(permissionObj);
            return null;
          });
          return null;
        });
        return null;
      });
      const uniqarrayCenter = _.uniqWith(arrayCenter, _.isEqual);
      if (permissionflag) {
        if (_.isEqual(permissionflag, uniqarrayCenter)) {
        } else {
          axios.post('/iam/v1/permissions/testPermission', JSON.stringify(uniqarrayCenter))
            .then((data) => {
              AppState.setPerMission(data);
            });
        }
      } else {
        permissionflag = uniqarrayCenter;
        axios.post('/iam/v1/permissions/testPermission', JSON.stringify(uniqarrayCenter))
          .then((data) => {
            AppState.setPerMission(data);
          });
      }
    }
  } else {
    return false;
  }
}

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
        callback(Choerodon.getMessage(`密码长度至少为${minLength}`, `Password length is at least ${minLength}`));
        return;
      }
      if (maxLength && (len > maxLength)) {
        callback(Choerodon.getMessage(`密码长度最多为${maxLength}`, `Password length is upto ${maxLength}`));
        return;
      }
      if (upcount && (up < upcount)) {
        callback(Choerodon.getMessage(`大写字母至少为${upcount}`, `At least for a capital letter ${upcount}`));
        return;
      }
      if (lowcount && (low < lowcount)) {
        callback(Choerodon.getMessage(`小写字母至少为${lowcount}`, `At least for a lower-case letters ${lowcount}`));
        return;
      }
      if (notEqualsUsername && value === userName) {
        callback(Choerodon.getMessage('密码不能与账号相同', 'password can not equal with the userName'));
        return;
      }
      if (regexCheck) {
        const regex = new RegExp(regexCheck);
        if (regex.test(value)) {
          callback();
        } else {
          callback(Choerodon.getMessage('正则不匹配', 'can not test regex'));
        }
      }
      if (spcount && (sp < spcount)) {
        callback(Choerodon.getMessage(`特殊字符至少为${spcount}`, `At least for special characters ${spcount}`));
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

// 前端存储cookie token
// function setAccessToken(token, expiresion) {
//   const expires = expiresion * 1000;
//   const expirationDate = new Date(Date.now() + expires);
//   let option;
//   if (JSON.parse(local)) {
//     option = {
//       path: '/',
//     }
//     setCookie(ACCESS_DOMAIN, document.location.hostname, option);
//     setCookie(ACCESS_TOKEN, token, option);
//   } else {
//     if(localReg.test(document.location.hostname)) {
//       option = {
//         path: '/',
//       }
//       setCookie(ACCESS_DOMAIN, document.location.hostname, option);
//       setCookie(ACCESS_TOKEN, token, option);
//     } else {
//       if (_.isNull(getCookie(ACCESS_DOMAIN))) {
//         option = {
//           path: '/',
//           domain: cookieServer
//         }
//         setCookie(ACCESS_DOMAIN, cookieServer, option);
//         setCookie(ACCESS_TOKEN, token, option);
//       } else {
//         option = {
//           path: '/',
//           domain: cookieServer
//         }
//         const cookieReg = new RegExp(`^${getCookie(ACCESS_DOMAIN)}$`, 'g');
//         if (cookieReg.test(cookieServer)) {
//           setCookie(ACCESS_TOKEN, token, option);
//           setCookie(ACCESS_DOMAIN, getCookie(ACCESS_DOMAIN), option);
//         }
//       }
//     }
//   }
// }
function setAccessToken(token, expiresion) {
  const expires = expiresion * 1000;
  const expirationDate = new Date(Date.now() + expires);
  let option;
  if (JSON.parse(local)) {
    option = {
      path: '/',
    };
    setCookie(ACCESS_TOKEN, token, option);
  } else {
    if (localReg.test(document.location.hostname)) {
      option = {
        path: '/',
      };
      setCookie(ACCESS_TOKEN, token, option);
    } else {
      if (_.isNull(getCookie(ACCESS_DOMAIN))) {
        option = {
          path: '/',
          domain: cookieServer,
        };
        setCookie(ACCESS_TOKEN, token, option);
      }
    }
  }
}

// 移除token
function removeAccessToken() {
  let option;
  if (JSON.parse(local)) {
    option = {
      path: '/',
    };
  } else {
    if (localReg.test(document.location.host)) {
      option = {
        path: '/',
      };
    } else {
      option = {
        path: '/',
        domain: cookieServer,
      };
    }
  }
  removeCookie(ACCESS_TOKEN, option);
}

// 多语言
function languageChange(id, otherProps) {
  return <FormattedMessage id={`${id}`} {...otherProps} />;
}

// 登出
function logout() {
  removeAccessToken();
  localStorage.clear();
  sessionStorage.clear();
  window.location = `${process.env.AUTH_HOST}/logout`;
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
function prompt(content, type = 'info', duration, placement = "leftBottom", onClose) {
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

// 没有权限跳转
function unauthorized() {
  // Choerodon.removeAccessToken();
  axios.get('/oauth/logout');
  AppState.setAuthenticated(false);
  window.location = `${Choerodon.AUTH_URL}`;
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

// 获得主题配置
function setTheme(site, color) {
  if (theme) {
    if (theme[site]) {
      return theme[site];
    } else {
      return color;
    }
  }
}

// 获取住配置
function getConfig(site) {
  if (config) {
    return config[site];
  }
}

function getMenuCode(data, type, permission, organid, proid) {
  permission.map(value => {
    if (type === 'organization') {
      permission = {
        'name': `${data}.${value}`,
        'resourceId': organid,
        'resourceType': type,
        'organizationId': organid,
      };
    } else if (type === 'project') {
      permission = {
        'name': `${data}.${value}`,
        'resourceId': proid,
        'resourceType': type,
        'organizationId': organid,
      };
    }
    MenuCode.push(permission);
  });
  const uniqMenuCode = _.uniqBy(MenuCode, 'name');
  return uniqMenuCode;
}

function analysisUrl(str) {
  const index = str.lastIndexOf('\?');
  if (index === -1) {
    return null;
  } else {
    const url = str.substring(index + 1, str.length);
    return url;
  }
}

var getHashStringArgs = function (url) {
  if (url == null) {
    return null;
  } else {
    var hashStrings = url,
      hashArgs = {},
      items = hashStrings.length > 0 ? hashStrings.split('&') : [],
      item = null,
      name = null,
      value = null,
      i = 0,
      len = items.length;
    for (i = 0; i < len; i++) {
      item = items[i].split('=');
      name = decodeURIComponent(item[0]);
      value = decodeURIComponent(item[1]);
      if (name.length > 0) {
        hashArgs[name] = value;
      }
    }
    return hashArgs;
  }
};

function getPermission(data, service, type, organizationId, projectId) {
  let approve;
  let newData = [];
  let approveArray = [];
  // newData =  _.uniqWith(_.flattenDeep(data), _.isEqual).slice()[0];
  newData = data;
  service.map(valueCode => {
    if (newData && newData.length && newData.length > 0) {
      for (let i = 0; i < newData.length; i += 1) {
        for (let j = 0; j < newData[i].length; j += 1) {
          if (newData[i][j].code === valueCode) {
            if (newData[i][j].resourceType === type) {
              approve = newData[i][j].approve;
              // if (type === 'organization') {
              //   approve = newData[i][j].approve;
              // } else if (type === 'project') {
              //   approve = newData[i][j].approve;
              // } else {
              //   approve = newData[i][j].approve;
              // }
            }
          }
        }
      }

    };
    approveArray.push(approve);
  })
  if (_.indexOf(approveArray, true) >= 0) {
    return true;
  } else {
    return false;
  }
}

function historyPushMenu(history, path, uri, method = 'push') {
  if (JSON.parse(local)) {
    history[method](path);
  } else {
    if (uri) {
      const pathreg = new RegExp('undefined', 'g');
      if (pathreg.test(path)) {
        window.location = `${uri}`;
      } else {
        const reg = new RegExp(`${uri}`, 'g');
        if (reg.test(document.location.host)) {
          history[method](path);
        } else {
          _.compact(path.split('?')).join('');
          window.location = `${uri}/#${_.compact(path.split('?')).join('?')}`;
        }
      }
    } else {
      history[method](path);
    }
  }
}

function historyReplaceMenu(history, path, uri) {
  historyPushMenu(history, path, uri, 'replace');
}

window.Choerodon = {
  ACCESS_TOKEN,
  AUTH_URL,
  getAccessToken,
  setCookie,
  getCookie,
  removeCookie,
  setAccessToken,
  removeAccessToken,
  languageChange,
  getMessage,
  logout,
  prompt,
  checkPassword,
  handleResponseError,
  randomString,
  unauthorized,
  setTheme,
  getConfig,
  getMenuCode,
  getPermission,
  permissonGet,
  nprogress,
  fullscreen,
  historyPushMenu,
  historyReplaceMenu,
};
// })();
