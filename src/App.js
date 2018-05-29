/*eslint-disable*/
import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch, } from 'react-router-dom';
import { LocaleProvider } from 'choerodon-ui';
import { observer, Provider } from 'mobx-react';
import { createBrowserHistory } from 'history';
import stores from './app/generate/stores';
import AppState from 'AppState';
import asyncLocaleProvider from './util/asyncLocaleProvider';
import asyncRouter from './util/asyncRouter';
import asyncPropsLoader from './util/asyncPropsLoader';
import '../src/containers/asset/fonts/style.css';
import '../node_modules/roboto-fontface/css/roboto-condensed/roboto-condensed-fontface.css';
import '../node_modules/roboto-fontface/css/roboto-slab/roboto-slab-fontface.css';
import '../node_modules/roboto-fontface/css/roboto/roboto-fontface.css';

const Masters = asyncRouter(() => import('Masters'));

@observer
export default class App extends Component {

  componentWillMount() {
    this.handleAuth();
  }

  handleAuth = () => {
    let token = Choerodon.getAccessToken(window.location.hash);
    if (token) {
      Choerodon.setAccessToken(token, 60 * 60);
    }
    AppState.loadUserInfo().then(data => {
      AppState.setUserInfo(data);
    });
  };

  render() {
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`./containers/locale/${langauge}`), () => import(`react-intl/locale-data/${langauge.split('_')[0]}`));
    const LocaleProviderAsync = asyncPropsLoader(LocaleProvider,
      import(`choerodon-ui/es/locale-provider/${langauge}.js`).then(({ default: locale }) => ({ locale })));
    return (
      <LocaleProviderAsync>
        <IntlProviderAsync>
          <Provider {...stores}>
            <div>
              {/* <DevTools /> */}
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
