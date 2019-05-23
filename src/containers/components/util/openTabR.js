import MenuStore from '../../stores/pro/MenuStore';

function openTabR(url, title, key) {
  if (!key) {
    MenuStore.openTabR(url, title);
    return;
  }

  const type = 'REACT';
  const { tabs } = MenuStore;
  const targetTabIndex = tabs.findIndex(tab => tab.url === key);
  if (targetTabIndex !== -1) {
    MenuStore.loadMenus().then((me) => {
      MenuStore.getPathById(url.slice(1), me, type, (temppath, targetNode) => {
        if (tabs.find(tab => tab.functionCode === targetNode.functionCode)) {
          MenuStore.openTabR(url, title);
        } else {
          tabs[targetTabIndex] = targetNode;
          MenuStore.openTabR(url, title);
        }
      }, () => {
        const construct = {
          children: null,
          expand: false,
          functionCode: key,
          icon: null,
          id: -1,
          ischecked: null,
          score: -1,
          shortcutId: null,
          text: title,
          url: url.slice(1),
          symbol: type,
        };
        tabs[targetTabIndex] = construct;
        MenuStore.openTabR(url, title);
      });
    });
  }
  MenuStore.openTabR(url, title);
}

export default openTabR;
