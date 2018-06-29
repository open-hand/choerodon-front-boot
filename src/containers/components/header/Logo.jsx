import React from 'react';
import { Icon } from 'choerodon-ui';
import MenuStore from '../../stores/MenuStore';
import AppState from '../../stores/AppState';

function handleMenuClick() {
  AppState.setMenuExpanded(!AppState.getMenuExpanded);
}

const Logo = () => {
  const menus = MenuStore.getMenuData;
  return (
    <div className="header-logo-wrap">
      {
        // menus.length ?
        true ?
          <div className="header-logo-menu-icon" onClick={handleMenuClick}>
            <Icon type="menu" />
          </div> :
          <div className="header-logo-icon" />
      }
      <div className="header-logo" />
    </div>
  );
};

export default Logo;
