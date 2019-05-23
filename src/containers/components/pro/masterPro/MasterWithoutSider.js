import React from 'react';
import { inject, observer } from 'mobx-react';
import { HashRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import 'moment/locale/zh-cn';
import SockJS from 'sockjs-client';
import { localeContext, ModalContainer } from 'choerodon-ui/pro';
import Loading from '../entryCmp/Loading';
import axios from '../axios';
import getHotkeyManager from './HotkeyManager';
import getIntlManager from './IntlManager';
import repeatLogin from '../../../common/repeatLogin';
import { WEBSOCKET_SERVER } from '../../../common/constants';
import './style';

@inject('AppState')
@observer
export default class Index extends React.Component {
  state = {
    loading: true,
  }

  componentDidMount() {
    this.loadAdvance();
  }

  loadAdvance() {
    Promise.all([this.auth(), this.loadLocale(), this.loadSysInfo()])
      .then((res) => {
        if (res.every(item => item)) {
          this.setState({
            loading: false,
          });

          this.handleLocaleContext();
          this.initHotkeyManager();
          this.initIntl();
          this.initSocket();
        }
      });
  }

  initSocket() {
    const socket = new SockJS(`${WEBSOCKET_SERVER}/websocket`);
    socket.onmessage = (e) => {
      if (e.data && e.data.action === 'SYS_REPEAT_LOGIN') {
        socket.close();
        repeatLogin();
      }
    };
  }

  /**
   * query hotkey dictionary
   * and set in manager
   */
  initHotkeyManager() {
    const hotkeyManager = getHotkeyManager();
    axios.post('/dataset/Hotkey/queries?page=1&pagesize=10', {})
      .then((res) => {
        if (res.success) {
          hotkeyManager.init(res.rows);
        } else {
          hotkeyManager.init([]);
        }
      })
      .catch((error) => {
        hotkeyManager.init([]);
      });
  }

  initIntl() {
    const intlManager = getIntlManager();
    axios.post('/common/prompt/hap-common', {})
      .then((res) => {
        intlManager.add(res || {});
      })
      .catch((error) => {
        intlManager.add({});
      });
  }

  handleLocaleContext() {
    const { AppState } = this.props;
    const { locales, currentLang } = AppState;
    if (Object.keys(locales).length) {
      localeContext.setSupports(locales);
    }

    if (currentLang) {
      import(`choerodon-ui/pro/lib/locale-context/${currentLang}.js`)
        .then((o) => {
          localeContext.setLocale(o);
        });
    }
  }

  async auth() {
    const { AppState } = this.props;
    try {
      AppState.setUserInfo(await AppState.loadUserInfo());
      return true;
    } catch (error) {
      return false;
    }
  }

  async loadLocale() {
    const { AppState } = this.props;
    try {
      AppState.setLocales(await AppState.loadLocale());
      return true;
    } catch (error) {
      return false;
    }
  }

  async loadSysInfo() {
    const { AppState } = this.props;
    try {
      AppState.setSysInfo(await AppState.loadSysInfo());
      return true;
    } catch (error) {
      return false;
    }
  }

  render() {
    const { loading } = this.state;
    if (loading) {
      return <Loading />;
    }

    const { AutoRouter, AppState, UserMaster } = this.props;
    const title = AppState.title ? <title>{AppState.title}</title> : null;
    const originMaster = [
      <div className="master-body">
        <div className="master-content-wrapper">
          <div className="master-content-container">
            <div className="master-container">
              <div className="master-content">
                <AutoRouter />
              </div>
            </div>
          </div>
        </div>
      </div>,
    ];

    return (
      <div className="master-wrapper">
        <Helmet preserved>
          {title}
        </Helmet>
        {UserMaster ? <UserMaster AutoRouter={AutoRouter} /> : originMaster}
        <ModalContainer />
      </div>
    );
  }
}
