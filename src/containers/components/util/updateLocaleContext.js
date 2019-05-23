import { localeContext } from 'choerodon-ui/pro';
import AppState from '../../stores/pro/AppState';

// function addFunc(locales, langCode, description, changeSign) {
//   locales[langCode] = description;
//   changeSign();
// }

// function deleteFunc(locales, langCode, description, changeSign) {
//   if (locales[langCode]) {
//     delete locales[langCode];
//     changeSign();
//   }
// }

// function updateFunc(locales, langCode, description, changeSign) {
//   locales[langCode] = description;
//   changeSign();
// }

export default function updateLocalContext(mutationsRows) {
  if (!mutationsRows.length) {
    return;
  }

  let isChange = false;
  const locales = localeContext.supports;

  mutationsRows.forEach((row) => {
    const { __status, langCode, description } = row;
    // [`${__status}Func`](locales, langCode, description, () => { isChange = true; });
    if (__status === 'add') {
      locales[langCode] = description;
      isChange = true;
    } else if (__status === 'update') {
      locales[langCode] = description;
      isChange = true;
    } else if (__status === 'delete') {
      if (locales[langCode]) {
        delete locales[langCode];
        isChange = true;
      }
    }
  });

  AppState.setLocales(locales);

  if (isChange) {
    localeContext.setSupports(locales);
  }
}
