import MenuStore from '../../stores/pro/MenuStore';
import getCurrentTab from './getCurrentTab';

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

function handleCloseTab(tab) {
  const { selectedKeys } = MenuStore;
  if (selectedKeys.length && selectedKeys[0] === tab.code) {
    const desTab = MenuStore.getNextTab(tab);
    let desUrl;
    if (desTab.code !== 'HOME_PAGE') {
      const { code, route, pagePermissionType } = desTab;
      desUrl = getLinkByMenuType(pagePermissionType, route, code);
    } else {
      desUrl = '/';
      MenuStore.setActiveMenu({});
    }
    MenuStore.history.push(desUrl);
  }
  MenuStore.closeTabAndClearCacheByCacheKey(tab);
}

function closeTab(code) {
  let tab;
  if (!code) {
    tab = getCurrentTab();
  } else {
    const tabs = MenuStore.tabs.slice();
    const idx = tabs.findIndex(t => t.code === code);
    if (idx !== -1) {
      tab = tabs[idx];
    } else {
      return;
    }
  }
  handleCloseTab(tab);
}

window.openTab = closeTab;

export default closeTab;
