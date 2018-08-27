import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { configure } from 'mobx';
import { observer, Provider } from 'mobx-react';
import queryString from 'query-string';
import stores from '../{{ source }}/containers/stores/index';
import AppState from '../{{ source }}/containers/stores/AppState';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import asyncLocaleProvider from '../{{ source }}/containers/components/util/asyncLocaleProvider';
import { authorize, getAccessToken, setAccessToken } from '../{{ source }}/containers/common/index';
import '../{{ source }}/containers/components/style/index';

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
  render() {
    const language = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(language, () => import(`../{{ source }}/containers/locale/${language}`), () => import(`react-intl/locale-data/${language.split('_')[0]}`));
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
