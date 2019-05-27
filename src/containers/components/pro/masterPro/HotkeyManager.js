let hotkeyManager;

class HotkeyManager {
  constructor(handlers) {
    this.handlers = handlers || {};
    this.dictionary = [];
  }

  addHandlers(handlers) {
    const o = { ...this.handlers, ...handlers };
    this.handlers = o;
  }

  deleteHandlers(handlerKey) {
    if (this.handlers.handlerKey) {
      this.handlers.delete(handlerKey);
    }
  }

  init(dictionary) {
    this.dictionary = dictionary;
  }

  clearManger() {
    this.handlers = {};
    this.dictionary = [];
  }

  emit(handlerKey, hotkeyCodeString, event) {
    const hotkeyCode = this.dictionary.find(v => v.hotkey === hotkeyCodeString);
    if (!hotkeyCode) {
      return;
    }
    if (this.handlers[handlerKey]) {
      const func = this.handlers[handlerKey][hotkeyCode.code];
      if (typeof func === 'function') {
        func();
        event.stopPropagation();
        event.preventDefault();
      }
    }
  }
}

export default function getHotkeyManager() {
  if (!hotkeyManager) {
    hotkeyManager = new HotkeyManager();
  }
  return hotkeyManager;
}
