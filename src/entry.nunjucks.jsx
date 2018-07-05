/*eslint-disable*/
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { LocaleProvider } from 'choerodon-ui';
import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react';
import queryString from 'query-string';
import stores from '../lib/containers/stores';
import AppState from '../lib/containers/stores/AppState';
import asyncRouter from '../lib/containers/components/util/asyncRouter';
import asyncLocaleProvider from '../lib/containers/components/util/asyncLocaleProvider';
import asyncPropsLoader from '../lib/containers/components/util/asyncPropsLoader';
import { authorize, getAccessToken, setAccessToken } from '../lib/containers/common';

function auth() {
  const { access_token, token_type, expires_in } = queryString.parse(window.location.hash);
  if (access_token) {
    setAccessToken(access_token, token_type, expires_in);
  } else if (!getAccessToken()) {
    authorize();
    return false;
  }
  AppState.loadUserInfo().then(data => {
    AppState.setUserInfo(data);
  });
  return true;
}

const Masters = asyncRouter(() => import('../lib/containers/components/master'), () => import('{{ routesPath }}'));

@observer
class App extends Component {

  render() {
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../lib/containers/locale/${langauge}`), () => import(`react-intl/locale-data/${langauge.split('_')[0]}`));
    const LocaleProviderAsync = asyncPropsLoader(LocaleProvider,
      import(`choerodon-ui/es/locale-provider/${langauge}.js`).then(({ default: locale }) => ({ locale })));
    return (
      <LocaleProviderAsync>
        <IntlProviderAsync>
          <Provider {...stores}>
            <div>
              <Router hashHistory={createBrowserHistory}>
                <Switch>
                  <Route path='/' component={Masters} />
                </Switch>
              </Router>
            </div>
          </Provider>
        </IntlProviderAsync>
      </LocaleProviderAsync>
    );
  }
}

if (auth()) {
  configure({ enforceActions: true });

  render(<App />, document.getElementById('app'));
}
