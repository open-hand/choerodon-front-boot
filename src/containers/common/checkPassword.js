import { getMessage } from './intl';

export default function checkPassword(passwordPolicy, value, callback, userName) {
  if (passwordPolicy) {
    const {
      enablePassword: check, minLength, maxLength,
      uppercaseCount: upcount, specialCharCount: spcount,
      lowercaseCount: lowcount, notUsername: notEqualsUsername,
      regularExpression: regexCheck,
    } = passwordPolicy;
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
      const pattern = new RegExp('[-~`@#$%^&*_=+|/()<>,.;:!]');
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
