const MENU_TYPE = {
  react: 'page',
  html: 'html_page',
  api: 'api',
  dataset: 'dataset',
  factor: 'factor',
  metadata: '',
};

const htmlPlaceholder = '/iframe/';
const metadataPlaceholder = '/hap-modeling/metadata/';

function getLinkByMenuType(menuType, route, code) {
  if (menuType === MENU_TYPE.react) {
    return `${route}`;
  }
  if (menuType === MENU_TYPE.html) {
    return `${htmlPlaceholder}${code}`;
  }
  if (menuType === MENU_TYPE.metadata) {
    return `${metadataPlaceholder}${route}`;
  }
  return route || '/';
}

function getTypeByLink(url) {
  let menuType = MENU_TYPE.react;
  if (url.startsWith(htmlPlaceholder)) {
    menuType = MENU_TYPE.html;
  }
  if (url.startsWith(metadataPlaceholder)) {
    menuType = MENU_TYPE.metadata;
  }
  return menuType;
}

function getKeyAndTypeByLink(url, type) {
  if (!type) {
    type = getTypeByLink(url);
  }
  const key = {
    html_page: url.slice(htmlPlaceholder.length),
    metadata: url.slice(metadataPlaceholder.length),
    page: url,
  }[type];
  return { key, type };
}

export {
  MENU_TYPE,
  getLinkByMenuType,
  getTypeByLink,
  getKeyAndTypeByLink,
};
