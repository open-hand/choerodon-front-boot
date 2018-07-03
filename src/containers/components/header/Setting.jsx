import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { Button, Icon } from 'choerodon-ui';
import findFirstLeafMenu from '../util/findFirstLeafMenu';

@withRouter
@inject('AppState', 'MenuStore')
@observer
export default class Setting extends Component {
  getGlobalMenuData = () => {
    const { MenuStore, history } = this.props;
    MenuStore.loadMenuData({ type: 'site' }, false).then(menus => {
      if (menus.length) {
        const { route, domain } = findFirstLeafMenu(menus[0]);
        Choerodon.historyPushMenu(history, route, domain);
      }
    });
  };

  render() {
    const { AppState } = this.props;
    const classString = classNames({
      active: AppState.currentMenuType.type === 'site' && !AppState.isTypeUser,
    });
    return (
      <Button className={classString} onClick={this.getGlobalMenuData}>
        {Choerodon.getMessage('管理', 'Manage')}
        <Icon className="manager-icon" type="settings " />
      </Button>
    );
  }
}
