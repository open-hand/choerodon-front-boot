import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Popover, Icon } from 'choerodon-ui';
import Avatar from './Avatar';
import findFirstLeafMenu from '../util/findFirstLeafMenu';
import { getMessage, historyPushMenu, logout } from '../../common';
import { PREFIX_CLS } from '../../common/constants';

const MenuItem = Menu.Item;
const prefixCls = `${PREFIX_CLS}-boot-header-user`;
const blackList = new Set(['choerodon.code.usercenter.receive-setting']);

@withRouter
@inject('AppState', 'MenuStore', 'HeaderStore')
@observer
export default class UserPreferences extends Component {
  componentDidMount() {
    const { history, MenuStore } = this.props;
    if (window.location.href.split('#')[1].split('&')[1] === 'token_type=bearer') {
      history.push('/');
    }
    MenuStore.loadMenuData({ type: 'site' }, true);
  }

  preferences = () => {
    const { MenuStore, history, HeaderStore } = this.props;
    MenuStore.loadMenuData({ type: 'site' }, true).then((menus) => {
      if (menus.length) {
        const { route, domain } = findFirstLeafMenu(menus[0]);
        historyPushMenu(history, `${route}?type=site`, domain);
      }
    });
    HeaderStore.setUserPreferenceVisible(false);
  };

  handleVisibleChange = (visible) => {
    this.props.HeaderStore.setUserPreferenceVisible(visible);
  };

  handleMenuItemClick = ({ key }) => {
    const { history } = this.props;
    history.push(`${key}?type=site`);
  };

  render() {
    const { AppState, HeaderStore, MenuStore } = this.props;
    const { imageUrl, loginName, realName, email } = AppState.getUserInfo || {};
    const realData = MenuStore.menuGroup && MenuStore.menuGroup.user.slice()[0] && MenuStore.menuGroup.user.slice()[0].subMenus.filter(item => !blackList.has(item.code));
    const AppBarIconRight = (
      <div className={`${prefixCls}-popover-content`}>
        <Avatar src={imageUrl} prefixCls={prefixCls}>
          {realName && realName.charAt(0)}
        </Avatar>
        <div className={`${prefixCls}-popover-title`}>
          <span>{realName}</span>
          <span>{email}</span>
        </div>
        <div className={`${prefixCls}-popover-menu`}>
          <Menu selectedKeys={[-1]} onClick={this.handleMenuItemClick}>
            {realData && realData.map(item => (
              <MenuItem className={`${prefixCls}-popover-menu-item`} key={item.route}>
                <Icon type={item.icon} />
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </div>
        <div className="divider" />
        <div className={`${prefixCls}-popover-logout`}>
          <li
            onClick={() => logout()}
          >
            <Icon type="exit_to_app" />{getMessage('退出登录', 'sign Out')}
          </li>
        </div>
      </div>
    );
    return (
      <Popover
        overlayClassName={`${prefixCls}-popover`}
        content={AppBarIconRight}
        trigger="click"
        visible={HeaderStore.userPreferenceVisible}
        placement="bottomRight"
        onVisibleChange={this.handleVisibleChange}
      >
        <Avatar src={imageUrl} prefixCls={prefixCls}>
          {realName && realName.charAt(0)}
        </Avatar>
      </Popover>
    );
  }
}
