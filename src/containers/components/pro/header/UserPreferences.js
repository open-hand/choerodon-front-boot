import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Popover, Avatar, Button } from 'choerodon-ui';
import axios from '../axios';
import { authorize, logout } from '../../../common/authorize';
import defaultAvatarPath from './style/icons/avatar.png';

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

  render() {
    const { AppState, HeaderStore } = this.props;
    const { imageUrl, userName, email } = AppState.getUserInfo || {};
    const picUrl = imageUrl || defaultAvatarPath;

    const AppBarIconRight = (
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
          <Avatar src={picUrl}>
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
