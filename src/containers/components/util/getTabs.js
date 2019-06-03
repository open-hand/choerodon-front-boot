import MenuStore from '../../stores/pro/MenuStore';

function getTabs() {
  return MenuStore.tabs.slice();
}

window.getTabs = getTabs;

export default getTabs;
