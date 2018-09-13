import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Popover } from 'choerodon-ui';
import Avatar from './Avatar';
import findFirstLeafMenu from '../util/findFirstLeafMenu';
import { getMessage, historyPushMenu, logout } from '../../common';
import { PREFIX_CLS } from '../../common/constants';

const prefixCls = `${PREFIX_CLS}-boot-header-user`;

@withRouter
@inject('AppState', 'MenuStore', 'HeaderStore')
@observer
export default class UserPreferences extends Component {
  componentDidMount() {
    const { history } = this.props;
    if (window.location.href.split('#')[1].split('&')[1] === 'token_type=bearer') {
      history.push('/');
    }
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

  render() {
    const { AppState, HeaderStore } = this.props;
    const { imageUrl, loginName, realName, email } = AppState.getUserInfo || {};
    const AppBarIconRight = (
      <div className={`${prefixCls}-popover-content`}>
        <Avatar src={imageUrl} prefixCls={prefixCls}>
          {realName && realName.charAt(0)}
        </Avatar>
        <div className={`${prefixCls}-popover-title`}>
          {loginName}
        </div>
        <div className={`${prefixCls}-popover-text`}>
          {realName}
        </div>
        <div className={`${prefixCls}-popover-text`}>
          {email}
        </div>
        <div className={`${prefixCls}-popover-button-group`}>
          <Button
            funcType="raised"
            type="primary"
            onClick={this.preferences.bind(this)}
          >
            {getMessage('个人中心', 'user preferences')}
          </Button>
          <Button
            funcType="raised"
            onClick={() => logout()}
          >
            {getMessage('退出登录', 'sign Out')}
          </Button>
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
