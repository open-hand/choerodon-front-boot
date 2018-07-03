import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon } from 'choerodon-ui';

@inject('AppState')
@inject('MenuStore')
@observer
export default class Logo extends Component {

  handleMenuClick = () => {
    const { AppState } = this.props;
    AppState.setMenuExpanded(!AppState.getMenuExpanded);
  };

  render() {
    const { MenuStore } = this.props;
    const menus = MenuStore.getMenuData;
    return (
      <div className="header-logo-wrap">
        {
          menus.length ?
            <div className="header-logo-menu-icon" onClick={this.handleMenuClick}>
              <Icon type="menu" />
            </div> :
            <div className="header-logo-icon" />
        }
        <div className="header-logo" />
      </div>
    );
  }
}
