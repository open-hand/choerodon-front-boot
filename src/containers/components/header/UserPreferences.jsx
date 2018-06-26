import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Popover } from 'choerodon-ui';
import MenuStore from '../../stores/MenuStore';
import Avatar from './Avatar';
import findFirstLeafMenu from '../util/findFirstLeafMenu';

@inject('AppState')
@observer
class UserPreferences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    if (window.location.href.split('#')[1].split('&')[1] === 'token_type=bearer') {
      history.push('/');
    }
  }

  preferences = () => {
    const { AppState, history } = this.props;
    MenuStore.loadMenuData({ type: 'site' }, true).then(menus => {
      if (menus.length) {
        const { route, domain } = findFirstLeafMenu(menus[0]);
        Choerodon.historyPushMenu(history, `${route}?type=site`, domain);
      }
    });
    this.setState({
      visible: false,
    });
  };

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  };

  render() {
    const { AppState } = this.props;
    const { imageUrl, loginName, realName, email } = AppState.getUserInfo || {};
    const AppBarIconRight = (
      <div className="user-preference-popover-content">
        <Avatar src={Choerodon.fileServer(imageUrl)}>
          {realName && realName.charAt(0)}
        </Avatar>
        <div className="popover-title">
          {loginName}
        </div>
        <div className="popover-text">
          {realName}
        </div>
        <div className="popover-text">
          {email}
        </div>
        <div className="popover-button-wrapper">
          <Button
            funcType="raised"
            type="primary"
            onClick={this.preferences.bind(this)}
          >{Choerodon.getMessage('个人中心', 'user preferences')}</Button>
          <Button
            funcType="raised"
            onClick={() => Choerodon.logout()}
          >{Choerodon.getMessage('退出登录', 'sign Out')}</Button>
        </div>
      </div>
    );
    return (
      <Popover
        overlayClassName="user-preference-popover"
        content={AppBarIconRight}
        trigger="click"
        visible={this.state.visible}
        placement="bottomRight"
        onVisibleChange={this.handleVisibleChange}
      >
        <Avatar src={Choerodon.fileServer(imageUrl)}>
          {realName && realName.charAt(0)}
        </Avatar>
      </Popover>
    );
  }
}

export default withRouter(UserPreferences);
