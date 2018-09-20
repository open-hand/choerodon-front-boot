import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { Button } from 'choerodon-ui';
import { PREFIX_CLS } from '../../common/constants';
import { dashboard } from '../../common';

const prefixCls = `${PREFIX_CLS}-boot-header-logo`;

@withRouter
@inject('AppState', 'MenuStore')
@observer
export default class Logo extends Component {
  handleMenuClick = () => {
    const { AppState } = this.props;
    AppState.setMenuExpanded(!AppState.getMenuExpanded);
  };

  render() {
    const { AppState, MenuStore, location } = this.props;
    const { pathname, search } = location;
    const menus = MenuStore.getMenuData;
    let homePath = '/';
    if (dashboard) {
      const { type, id, name, organizationId } = AppState.currentMenuType;
      if (type && type !== 'site') {
        homePath = `${homePath}?type=${type}&id=${id}&name=${name}`;
        if (organizationId) {
          homePath += `&organizationId=${organizationId}`;
        }
      }
    }
    return (
      <div className={`${prefixCls}-wrap`}>
        {
          menus.length
            ? <Button shape="circle" icon="menu" className={`${prefixCls}-menu-icon`} onClick={this.handleMenuClick} />
            : <div className={`${prefixCls}-icon`} />
        }
        {
          pathname === '/' && !search
            ? <div className={prefixCls} />
            : <Link to={homePath} className={prefixCls} />
        }
      </div>
    );
  }
}
