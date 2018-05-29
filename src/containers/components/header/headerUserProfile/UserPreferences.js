/**
 * Created by hand on 2017/7/3.
 */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Col, Popover, Row, Button } from 'choerodon-ui';
import MenuStore from '@/stores/MenuStore';
import Avatar from './Avatar';
import './userPro.scss';

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
    AppState.changeMenuType({ type: 'site' });
    AppState.setTypeUser(true);
    MenuStore.loadMenuData('user').then(menus => {
      if (menus.length) {
        const { route, domain } = menus[0].subMenus[0];
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
      <div className="userPro-popver-content">
        <Avatar src={imageUrl}>
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
        <Row className="popover-button-wrapper">
          <Col>
            <Button
              funcType="raised"
              type="primary"
              onClick={this.preferences.bind(this)}
            >{Choerodon.getMessage('个人中心', 'user preferences')}</Button>
          </Col>
          <Col>
            <Button
              funcType="raised"
              onClick={() => Choerodon.logout()}
            >{Choerodon.getMessage('退出登录', 'sign Out')}</Button>
          </Col>
        </Row>
      </div>
    );
    return (
      <Popover
        overlayClassName="userPro-popver"
        content={AppBarIconRight}
        trigger="click"
        style={{ padding: '0!import' }}
        visible={this.state.visible}
        placement="bottomRight"
        onVisibleChange={this.handleVisibleChange}
      >
        <Avatar src={imageUrl}>
          {realName && realName.charAt(0)}
        </Avatar>
      </Popover>
    );
  }
}

export default withRouter(UserPreferences);
