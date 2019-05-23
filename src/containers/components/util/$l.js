import getIntlManager from '../pro/masterPro/IntlManager';

function $l(code, defaultValue = undefined) {
  const intlManager = getIntlManager();
  return intlManager.get(code) || defaultValue || code;
}

export default $l;
