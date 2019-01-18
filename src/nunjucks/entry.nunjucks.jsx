import 'babel-polyfill';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react';
import queryString from 'query-string';
import { Modal } from 'choerodon-ui';
import noaccess from '../{{ source }}/containers/components/error-pages/403';
import stores from '../{{ source }}/containers/stores';
import AppState from '../{{ source }}/containers/stores/AppState';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import asyncLocaleProvider from '../{{ source }}/containers/components/util/asyncLocaleProvider';
import { authorize, getAccessToken, setAccessToken, WEBSOCKET_SERVER } from '../{{ source }}/containers/common';
import WSProvider from '../{{ source }}/containers/components/ws/WSProvider';
import PermissionProvider from '../{{ source }}/containers/components/permission/PermissionProvider';
import '../{{ source }}/containers/components/style';

const { confirm } = Modal;
const UILocaleProviderAsync = asyncRouter(() => import('choerodon-ui/lib/locale-provider'), {
  locale: () => import(`choerodon-ui/lib/locale-provider/${AppState.currentLanguage}.js`),
});

const Masters = asyncRouter(() => import('../{{ source }}/containers/components/master'), {
  AutoRouter: () => import('{{ routesPath }}'),
  GuideRouter: () => import('{{ guidePath }}'),
});

const Outward = asyncRouter(() => import('../{{ source }}/containers/components/outward'), {
  AutoRouter: () => import('{{ routesPath }}'),
});

async function auth() {
  const { access_token: accessToken, token_type: tokenType, expires_in: expiresIn } = queryString.parse(window.location.hash);
  if (accessToken) {
    setAccessToken(accessToken, tokenType, expiresIn);
    // 去除url中的accessToken
    window.location.href = window.location.href.replace(/[&?]redirectFlag.*/g, '');
  } else if (!getAccessToken()) {
    authorize();
    return false;
  }
  AppState.setUserInfo(await AppState.loadUserInfo());
  return true;
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
    const language = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(language, () => import(`../{{ source }}/containers/locale/${language}`), () => import(`react-intl/locale-data/${language.split('_')[0]}`));
    if (window.location.hash === '#/organization/register-organization') {
      return (
        <UILocaleProviderAsync>
          <IntlProviderAsync>
            <Provider {...stores}>
              <Router hashHistory={createBrowserHistory} getUserConfirmation={this.getConfirmation}>
                <Switch>
                  <Route path="/" component={Outward} />
                </Switch>
              </Router>
            </Provider>
          </IntlProviderAsync>
        </UILocaleProviderAsync>
      );
    } else {
      return (
        <UILocaleProviderAsync>
          <IntlProviderAsync>
            <Provider {...stores}>
              <PermissionProvider>
                <WSProvider server={WEBSOCKET_SERVER}>
                  <Router hashHistory={createBrowserHistory} getUserConfirmation={this.getConfirmation}>
                    <Switch>
                      <Route
                        path="/"
                        component={auth() ? Masters : noaccess}
                      />
                    </Switch>
                  </Router>
                </WSProvider>
              </PermissionProvider>
            </Provider>
          </IntlProviderAsync>
        </UILocaleProviderAsync>
      );
    }
  }
}

configure({ enforceActions: 'observed' });

render(<App />, document.getElementById('app'));
