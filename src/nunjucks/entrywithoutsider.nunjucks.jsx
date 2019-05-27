import 'babel-polyfill';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { observer, Provider } from 'mobx-react';
import stores from '../{{ source }}/containers/stores';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import '../{{ source }}/containers/components/style';

let MASTERS;
const CHOERODON_HAP_FRONT_BOOT_MASTER_PAGE = 'CHOERODON_HAP_FRONT_BOOT_MASTER_PAGE';

function getMasters(component, mastersPath, type) {
  let injectObj = {};
  if (mastersPath) {
    injectObj = {
      AutoRouter: () => import('{{ routesPath }}'),
      UserMaster: mastersPath ? component : undefined,
    };
  } else {
    injectObj = {
      AutoRouter: () => import('{{ routesPath }}'),
    };
  }
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

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <Router hashHistory={createBrowserHistory}>
          <Switch>
            <Route
              path="/"
              component={'{{ master }}'}
            />
          </Switch>
        </Router>
      </Provider>
    );
  }
}

render(<App />, document.getElementById('app'));
