import MenuStore from '../../stores/pro/MenuStore';

function getCurrentTab() {
  const tabs = MenuStore.tabs.slice();
  return tabs[MenuStore.currentTabIndex];
}

window.getCurrentTab = getCurrentTab;

export default getCurrentTab;
