import 'babel-polyfill';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { configure, autorun } from 'mobx';
import { observer, Provider } from 'mobx-react';
import queryString from 'query-string';
import { Modal } from 'choerodon-ui';
import noaccess from '../{{ source }}/containers/components/c7n/error-pages/403';
import stores from '../{{ source }}/containers/stores';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import asyncRouterC7n from '../{{ source }}/containers/components/c7n/util/asyncRouter';
import asyncLocaleProvider from '../{{ source }}/containers/components/util/asyncLocaleProvider';
import { authorizeC7n, getAccessToken, setAccessToken, WEBSOCKET_SERVER } from '../{{ source }}/containers/common';
import { TYPE, OUTWARD } from '../{{ source }}/containers/common/constants';
import WSProvider from '../{{ source }}/containers/components/c7n/ws/WSProvider';
import PermissionProvider from '../{{ source }}/containers/components/c7n/permission/PermissionProvider';
import '../{{ source }}/containers/components/style';

const { AppState } = stores;

let MASTERS;
const { confirm } = Modal;
const UILocaleProviderAsync = asyncRouterC7n(() => import('choerodon-ui/lib/locale-provider'), {
  locale: () => import(`choerodon-ui/lib/locale-provider/${TYPE === 'choerodon' ? AppState.currentLanguage : AppState.currentLang}.js`),
});

function getMasters(component, mastersPath, type) {
  const injectObj = {
    AutoRouter: () => import('{{ routesPath }}'),
    UserMaster: component,
  };
  if (!MASTERS) {
    const Cmp = asyncRouter(
      () => import('../{{ source }}/containers/components/pro/masterPro/MasterWithoutSider'),
      injectObj,
      { __refresh__: true },
    );
    MASTERS = Cmp;
  }
  return MASTERS;
}

async function authHap() {
  try {
    AppState.setUserInfo(await AppState.loadUserInfo());
    return true;
  } catch (error) {
    return false;
  }
}

async function loadLocale() {
  try {
    AppState.setLocales(await AppState.loadLocale());
    return true;
  } catch (error) {
    return false;
  }
}

async function loadSysInfo() {
  try {
    AppState.setSysInfo(await AppState.loadSysInfo());
    return true;
  } catch (error) {
    return false;
  }
}

async function loadAdvance() {
  Promise.all([authHap(), loadLocale(), loadSysInfo()])
    .then((res) => {
      if (res.every(item => item)) {
        return true;
      }
      return false;
    })
    .catch(() => {
      return false;
    });
}

function authAll() {
  return loadAdvance();
}

@observer
class App extends Component {
  getConfirmation = (message, callback) => {
    confirm({
      className: 'c7n-iam-confirm-modal',
      title: message.split(Choerodon.STRING_DEVIDER)[0],
      content: message.split(Choerodon.STRING_DEVIDER)[1],
      onOk() {
        callback(true);
      },
      onCancel() {
        callback(false);
      },
    });
  };

  render() {
    const language = TYPE === 'choerodon' ? AppState.currentLanguage : AppState.currentLang;
    const IntlProviderAsync = asyncLocaleProvider(language,
      () => import(`../{{ source }}/containers/locale/${language}`),
      () => import(`react-intl/locale-data/${language.split('_')[0]}`));
    
    return (
      <UILocaleProviderAsync>
        <IntlProviderAsync>
          <Provider {...stores}>
            <Router hashHistory={createBrowserHistory} getUserConfirmation={this.getConfirmation}>
              <Switch>
                <Route
                  path="/"
                  component={authAll() ? '{{ master }}' : noaccess}
                />
              </Switch>
            </Router>
          </Provider>
        </IntlProviderAsync>
      </UILocaleProviderAsync>
    );
  }
}

render(<App />, document.getElementById('app'));
