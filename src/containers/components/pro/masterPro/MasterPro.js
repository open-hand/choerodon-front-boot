import React from 'react';
import { inject, observer } from 'mobx-react';
import { HashRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import 'moment/locale/zh-cn';
import SockJS from 'sockjs-client';
import { localeContext, ModalContainer } from 'choerodon-ui/pro';
import { configure } from 'choerodon-ui';
import Loading from '../entryCmp/Loading';
import Menu from '../menu';
import axios from '../axios';
import uiAxios from '../axios/UiAxios';
import Tabbar from '../tabbar';
import Header from '../header';
import getHotkeyManager from './HotkeyManager';
import getIntlManager from './IntlManager';
import repeatLogin from '../../../common/repeatLogin';
import { WEBSOCKET_SERVER, UI_CONFIGURE } from '../../../common/constants';
import asyncRouter from '../../util/asyncRouter';
import asyncLocaleProvider from '../../util/asyncLocaleProvider';
import PermissionProvider from '../permission/PermissionProvider';
import './style';

@inject('AppState')
@observer
export default class Index extends React.Component {
  state = {
    loading: false,
  }

  componentDidMount() {
    this.handleLocaleContext();
    this.initHotkeyManager();
    this.initIntl();
    this.initSocket();
    this.initUiConfigure();
  }

  initUiConfigure = () => {
    const uiConfigure = UI_CONFIGURE || {};
    configure({
      ...uiConfigure,
      axios: uiAxios,
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
    axios.post('/sys/hotkey/query', {})
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

  render() {
    const { loading } = this.state;
    if (loading) {
      return <Loading />;
    }

    const { AutoRouter, AppState, UserMaster } = this.props;
    const title = AppState.title ? <title>{AppState.title}</title> : null;

    const originMaster = [
      <Header />,
      <div className="master-body">
        <div className="master-content-wrapper">
          <Menu />
          <div className="master-content-container">
            <div className="master-container">
              <Tabbar />
              <div className="master-content">
                <AutoRouter />
              </div>
            </div>
          </div>
        </div>
      </div>,
    ];

    return (
      <PermissionProvider>
        <div className="master-wrapper">
          <Helmet preserved>
            {title}
          </Helmet>
          {UserMaster ? <UserMaster AutoRouter={AutoRouter} /> : originMaster}
          <ModalContainer />
        </div>
      </PermissionProvider>
    );
  }
}
