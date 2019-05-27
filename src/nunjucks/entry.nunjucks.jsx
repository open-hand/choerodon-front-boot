import 'babel-polyfill';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Modal } from 'choerodon-ui';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { observer, Provider } from 'mobx-react';
import { TYPE } from '../{{ source }}/containers/common/constants';
import stores from '../{{ source }}/containers/stores';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import '../{{ source }}/containers/components/style';

let MASTERS;
const { confirm } = Modal;

const outwardPath = ['#/organization/register-organization', '#/organization/register-organization/agreement'];

function getMasters(component, mastersPath, type) {
  const injectObj = {
    AutoRouter: () => import('{{ routesPath }}'),
    UserMaster: component,
  };
  if (TYPE === 'choerodon') {
    injectObj.GuideRouter = () => import('{{ guidePath }}');
  }
  if (!MASTERS) {
    const Cmp = asyncRouter(
      () => import('{{ masterOutterPath }}'),
      injectObj,
      { __refresh__: true },
    );
    MASTERS = Cmp;
  }
  return MASTERS;
}

const Outward = asyncRouter(() => import('../{{ source }}/containers/components/c7n/outward'), {
  AutoRouter: () => import('{{ routesPath }}'),
});

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
    if (outwardPath.includes(window.location.hash)) {
      return (
        <Provider {...stores}>
          <Router hashHistory={createBrowserHistory} getUserConfirmation={this.getConfirmation}>
            <Switch>
              <Route path="/" component={Outward} />
            </Switch>
          </Router>
        </Provider>
      );
    }
    return (
      <Provider {...stores}>
        <Router hashHistory={createBrowserHistory} getUserConfirmation={this.getConfirmation}>
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
