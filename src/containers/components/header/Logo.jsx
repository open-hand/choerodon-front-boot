import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Button } from 'choerodon-ui';

const prefixCls = 'header-logo';

@withRouter
@inject('AppState', 'MenuStore')
@observer
export default class Logo extends Component {

  handleMenuClick = () => {
    const { AppState } = this.props;
    AppState.setMenuExpanded(!AppState.getMenuExpanded);
  };

  render() {
    const { MenuStore, location } = this.props;
    const { pathname, search } = location;
    const menus = MenuStore.getMenuData;
    return (
      <div className={`${prefixCls}-wrap`}>
        {
          menus.length ?
            <Button shape="circle" icon="menu" className={`${prefixCls}-menu-icon`} onClick={this.handleMenuClick} /> :
            <div className={`${prefixCls}-icon`} />
        }
        {
          pathname === '/' && !search ?
            <div className={prefixCls} /> :
            <Link to="/" className={prefixCls} />
        }
      </div>
    );
  }
}
