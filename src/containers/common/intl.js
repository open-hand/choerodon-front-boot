import React from 'react';
import { FormattedMessage } from 'react-intl';
import AppState from '../stores/AppState';

/**
 * 多语言
 */
function intl(id, otherProps) {
  return <FormattedMessage id={id} {...otherProps} />;
}

/**
 * @deprecated
 * 返回多语言字符串
 */
function getMessage(zh, en) {
  const language = AppState.currentLanguage.split('_')[0];
  if (language === 'zh') {
    return zh;
  } else if (language === 'en') {
    return en;
  }
  return false;
}

export {
  intl,
  getMessage,
};
