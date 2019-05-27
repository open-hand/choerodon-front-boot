import { observer } from 'mobx-react';
import AppState from '../../../stores/pro/AppState';
import { NODE_ENV } from '../../../common/constants';

let intlManager;

// @observer
class IntlManager {
  constructor() {
    this.intls = {};
  }

  add(intlObj) {
    if (NODE_ENV === 'development') {
      window.console.log('[IntlManager]: before add, the intls is', this.intls);
      window.console.log('[IntlManager]: the intlObj is', intlObj);
    }
    this.intls = Object.assign(this.intls, intlObj);
    if (NODE_ENV === 'development') {
      window.console.log('[IntlManager]: after add, the intls is:', this.intls);
    }
  }

  delete(code) {
    if (this.intls[code]) {
      delete this.intls[code];
    }
  }

  clear() {
    this.intls = {};
  }

  get(code) {
    return this.intls[code] || undefined;
  }
}

export default function getIntlManager() {
  if (!intlManager) {
    intlManager = new IntlManager();
  }
  return intlManager;
}
