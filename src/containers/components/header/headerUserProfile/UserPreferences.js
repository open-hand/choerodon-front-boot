/**
 * Created by hand on 2017/7/3.
 */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Popover, Row, Col } from 'choerodon-ui';
import MenuStore from '@/stores/MenuStore';
import './userPro.scss';

@inject('AppState')
@observer
class UserPreferences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      imgUrl: '',
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
    if (this.props.imgUrl && this.props.imgUrl !== null) {
      this.state.imgUrl = this.props.imgUrl;
    } else {
      this.state.imgUrl = '';
    }
    const { AppState } = this.props;
    const user = AppState.currentUser;
    const AppBarIconRight = (
      <div className="userPro-popver-content">
        <Row>
          <Col span={24} className="popover-col">
            {this.state.imgUrl !== '' ? (
                <img
                  alt=""
                  src={`data:img/jpg;base64,${this.state.imgUrl}`}
                  className="userPro-popver-content"
                />) :
              (
                <div className="popover-noImage-content">
                  {user ? user.realName.substr(0, 1).toUpperCase() : ''}
                </div>
              )}
          </Col>
        </Row>
        <Row>
          <Col span={24} className="popover-title">
            {user ? user.name : ''}
          </Col>
        </Row>
        <Row>
          <Col span={24} className="popover-text">
            {user ? user.realName : ''}
          </Col>
        </Row>
        <Row className="popover-button-wrapper">
          <Col>
            <a
              role="none"
              className="bth-center"
              onClick={this.preferences.bind(this)}
            >{Choerodon.getMessage('个人中心', 'user preferences')}</a>
          </Col>
          <Col>
            <a
              role="none"
              className="btn-signOut"
              type="primary"
              onClick={() => Choerodon.logout()}
            >{Choerodon.getMessage('退出登录', 'sign Out')}</a>
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
        {this.state.imgUrl ? (
          <img
            className="userPro-img"
            src={`data:img/jpg;base64,${this.state.imgUrl}`}
            alt="用户"
          />
        ) : (
          <div className="userPro-wrapper">
            {user ? user.realName.substr(0, 1).toUpperCase() : ''}
          </div>
        )}

      </Popover>
    );
  }
}

export default withRouter(UserPreferences);
