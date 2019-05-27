import AppState from '../../stores/pro/AppState';
import getHotkeyManager from '../pro/masterPro/HotkeyManager';

export default function updateHotkeys(mutationsRows) {
  if (!mutationsRows.length) {
    return;
  }

  let isChange = false;
  const hotkeyManager = getHotkeyManager();
  const { dictionary } = hotkeyManager;

  mutationsRows.forEach((row) => {
    const { __status, hotkeyId, description } = row;
    if (__status === 'add') {
      dictionary.push(row);
      isChange = true;
    } else if (__status === 'update') {
      const index = dictionary.findIndex(hotkey => hotkey.hotkeyId === hotkeyId);
      if (index !== -1) {
        dictionary[index] = row;
        isChange = true;
      }
    } else if (__status === 'delete') {
      const index = dictionary.findIndex(hotkey => hotkey.hotkeyId === hotkeyId);
      if (index !== -1) {
        dictionary.splice(index, 1);
        isChange = true;
      }
    }
  });

  if (isChange) {
    // localeContext.setSupports(locales);
  }
}
