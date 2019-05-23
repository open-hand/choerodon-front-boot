import MenuStore from '../../stores/pro/MenuStore';

function openTab(id, title, url, closeIcon) {
  MenuStore.openTab(id, title, url, closeIcon);
}

window.openTab = openTab;

export default openTab;
