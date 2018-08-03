/*eslint-disable*/
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react';
import queryString from 'query-string';
import stores from '../lib/containers/stores';
import AppState from '../lib/containers/stores/AppState';
import asyncRouter from '../lib/containers/components/util/asyncRouter';
import asyncLocaleProvider from '../lib/containers/components/util/asyncLocaleProvider';
import { authorize, getAccessToken, setAccessToken } from '../lib/containers/common';

async function auth() {
  const { access_token, token_type, expires_in } = queryString.parse(window.location.hash);
  if (access_token) {
    setAccessToken(access_token, token_type, expires_in);
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

const Masters = asyncRouter(() => import('../lib/containers/components/master'), {
  AutoRouter: () => import('{{ routesPath }}'),
});

@observer
class App extends Component {

  render() {
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../lib/containers/locale/${langauge}`), () => import(`react-intl/locale-data/${langauge.split('_')[0]}`));
    return (
      <UILocaleProviderAsync>
        <IntlProviderAsync>
          <Provider {...stores}>
            <div>
              <Router hashHistory={createBrowserHistory}>
                <Switch>
                  <Route path="/" component={Masters} />
                </Switch>
              </Router>
            </div>
          </Provider>
        </IntlProviderAsync>
      </UILocaleProviderAsync>
    );
  }
}

if (auth()) {
  configure({ enforceActions: true });

  render(<App />, document.getElementById('app'));
}
