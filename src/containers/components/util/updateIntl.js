import AppState from '../../stores/pro/AppState';
import getIntlManager from '../pro/masterPro/IntlManager';

export default function updateIntl(mutationsRows) {
  if (!mutationsRows.length) {
    return;
  }

  const intlManager = getIntlManager();

  mutationsRows.forEach((row) => {
    const { __status, promptCode, description } = row;
    if (__status === 'add' || __status === 'update') {
      intlManager.add({ [promptCode]: description });
    } else if (__status === 'delete') {
      intlManager.delete(promptCode);
    }
  });
}
