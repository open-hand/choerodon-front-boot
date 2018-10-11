import 'babel-polyfill';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { configure } from 'mobx';
import { FormattedMessage, injectIntl } from 'react-intl';
import { observer, Provider } from 'mobx-react';
import queryString from 'query-string';
import { Modal } from 'choerodon-ui';
import stores from '../{{ source }}/containers/stores';
import AppState from '../{{ source }}/containers/stores/AppState';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import asyncLocaleProvider from '../{{ source }}/containers/components/util/asyncLocaleProvider';
import { authorize, getAccessToken, setAccessToken, WEBSOCKET_SERVER } from '../{{ source }}/containers/common';
import WSProvider from '../{{ source }}/containers/components/ws/WSProvider';
import PermissionProvider from '../{{ source }}/containers/components/permission/PermissionProvider';
import '../{{ source }}/containers/components/style';

const { confirm } = Modal;
async function auth() {
  const { access_token: accessToken, token_type: tokenType, expires_in: expiresIn } = queryString.parse(window.location.hash);
  if (accessToken) {
    setAccessToken(accessToken, tokenType, expiresIn);
  } else if (!getAccessToken()) {
    authorize();
    return false;
  }
  AppState.setUserInfo(await AppState.loadUserInfo());
  return true;
}

const UILocaleProviderAsync = asyncRouter(() => import('choerodon-ui/lib/locale-provider'), {
  locale: () => import(`choerodon-ui/lib/locale-provider/${AppState.currentLanguage}.js`),
});

const Masters = asyncRouter(() => import('../{{ source }}/containers/components/master'), {
  AutoRouter: () => import('{{ routesPath }}'),
});

@observer
class App extends Component {
  getConfirmation = (message, callback) => {
    confirm({
      title: message,
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
    return (
      <UILocaleProviderAsync>
        <IntlProviderAsync>
          <Provider {...stores}>
            <PermissionProvider>
              <WSProvider server={WEBSOCKET_SERVER}>
                <Router hashHistory={createBrowserHistory} getUserConfirmation={this.getConfirmation}>
                  <Switch>
                    <Route path="/" component={Masters} />
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

if (auth()) {
  configure({ enforceActions: 'observed' });

  render(<App />, document.getElementById('app'));
}
