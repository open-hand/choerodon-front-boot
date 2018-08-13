import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { nomatch } from '../lib/containers/components/index';
import asyncRouter from '../lib/containers/components/util/asyncRouter';
import { dashboard } from '../lib/containers/common/index';
import Dashboard from '{{ dashboardPath }}';

function createRoute(path, component) {
  return <Route path={path} component={asyncRouter(component)} />;
}

const Home = asyncRouter(
  dashboard ?
    () => import('../lib/containers/components/dashboard') :
    () => import('../lib/containers/components/home'),
  dashboard && Dashboard,
);

export default class AutoRouter extends Component {

  render() {
    return (
      <Switch>
        <Route exact path='/' component={Home} />
        {'{{ routes }}'}
        <Route path={'*'} component={nomatch} />
      </Switch>
    );
  }
}
