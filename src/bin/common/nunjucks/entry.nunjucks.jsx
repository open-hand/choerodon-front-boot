import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Modal } from 'choerodon-ui';
import asyncRouter from '../{{ source }}/containers/util/asyncRouter';

let MASTERS;
const { confirm } = Modal;

function getMasters(component) {
  const injectObj = {
    AutoRouter: () => import('{{ routesPath }}'),
  };
  if (!MASTERS) {
    const Cmp = asyncRouter(component, injectObj);
    MASTERS = Cmp;
  }
  return MASTERS;
}

const getConfirmation = (message, callback) => {
  confirm({
    className: 'c7n-iam-confirm-modal',
    title: message.split('__@.@__')[0],
    content: message.split('__@.@__')[1],
    onOk() {
      callback(true);
    },
    onCancel() {
      callback(false);
    },
  });
};

const App = () => (
  <Router hashHistory={createBrowserHistory} getUserConfirmation={getConfirmation}>
    <Switch>
      <Route path="/" component={'{{ master }}'} />
    </Switch>
  </Router>
);

render(<App />, document.getElementById('app'));
