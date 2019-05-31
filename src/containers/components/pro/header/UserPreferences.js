import React, { Component } from 'react';
import { get } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Menu, Popover, Button, Icon } from 'choerodon-ui';
import axios from '../axios';
import { authorize, logout } from '../../../common/authorize';
import defaultAvatarPath from './style/icons/avatar.png';
import Avatar from './Avatar';
import { getLinkByMenuType } from '../menu/util';

const prefixCls = 'user-preference';
const MenuItem = Menu.Item;

@withRouter
@inject('MenuStore', 'HeaderStore', 'AppState')
@observer
export default class UserPreferences extends Component {
  preferences() {
    // this.props.history.push('/iframe/MY_PROFILE');
    this.props.history.push('/hap-core/sys/preferences');
  }

  handleClickMsg() {
    this.props.history.push('/iframe/SYS_PREFERENCE');
  }

  handleLogout() {
    const { AppState } = this.props;
    if (AppState.isCas) {
      logout();
    } else {
      axios.post('/logout')
        .then(() => {
          authorize();
        });
    }
  }

  handleMenuItemClick = ({ key }) => {
    const { code, name, pagePermissionType, route, icon } = JSON.parse(key);
    const link = getLinkByMenuType(pagePermissionType, route, code);
    const { history } = this.props;
    history.push(`${link}`);
  };

  render() {
    const { AppState, MenuStore } = this.props;
    const { imageUrl, userName, email } = AppState.getUserInfo || {};
    const picUrl = imageUrl || defaultAvatarPath;
    const userData = get(MenuStore.menus, 'user') || [];
    const realData = userData.length
      ? userData.slice()[0].subMenus || []
      : [];
    
    const AppBarIconRight = (
      <div className={`${prefixCls}-popover-content`}>
        <Avatar src={picUrl} prefixCls={prefixCls}>
          {userName && userName.charAt(0)}
        </Avatar>
        <div className={`${prefixCls}-popover-title`}>
          <span>{userName}</span>
          <span>{email}</span>
        </div>
        <div className={`${prefixCls}-popover-menu`}>
          <Menu selectedKeys={[-1]} onClick={this.handleMenuItemClick}>
            {realData && realData.map(item => (
              <MenuItem className={`${prefixCls}-popover-menu-item`} key={JSON.stringify(item)}>
                <Icon type={item.icon} />
                {item.name}
              </MenuItem>
            ))}
          </Menu>
        </div>
        <div className="divider" />
        <div className={`${prefixCls}-popover-logout`}>
          <li
            onClick={this.handleLogout.bind(this)}
          >
            <Icon type="exit_to_app" /> 退出登录
          </li>
        </div>
      </div>
    );

    const AppBarIconRightOld = (
      <div className="user-preference-popover-content">
        <Avatar src={picUrl} className="user-preference-avatar">
          {userName && userName.charAt(0)}
        </Avatar>
        <div className="popover-title">
          {userName}
        </div>
        <div className="popover-text">
          {email}
        </div>
        <div className="popover-msg-wrapper">
          <div
            className="popover-text"
            role="none"
            onClick={this.handleClickMsg.bind(this)}
          >
            {'用户信息'}
          </div>
          <div
            className="popover-text"
            role="none"
            onClick={this.handleClickMsg.bind(this)}
          >
            {'用户密码'}
          </div>
        </div>
        <div className="popover-button-wrapper">
          <Button
            funcType="raised"
            type="primary"
            onClick={this.preferences.bind(this)}
          >
            {'首选项'}
          </Button>
          <Button
            funcType="raised"
            onClick={this.handleLogout.bind(this)}
          >
            {'退出登录'}
          </Button>
        </div>
      </div>
    );

    return (
      <Popover
        overlayClassName="user-preference-popover"
        content={AppBarIconRight}
        trigger="click"
        placement="bottomRight"
      >
        <div className="user-preference">
          <Avatar src={picUrl} prefixCls={prefixCls}>
            {userName && userName.charAt(0)}
          </Avatar>
          <div className="user-preference-name">
            {userName}
          </div>
        </div>
      </Popover>
    );
  }
}
