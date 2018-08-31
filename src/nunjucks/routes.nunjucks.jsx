import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { nomatch } from '../{{ source }}/containers/components/index';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import { dashboard } from '../{{ source }}/containers/common/index';
import Dashboard from '{{ dashboardPath }}';

function createRoute(path, component) {
  return <Route path={path} component={asyncRouter(component)} />;
}

const Home = asyncRouter(
  dashboard
    ? () => import('../{{ source }}/containers/components/dashboard')
    : () => import('../{{ source }}/containers/components/home'),
  null,
  dashboard && Dashboard,
);

export default class AutoRouter extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        {'{{ routes }}'}
        <Route path="*" component={nomatch} />
      </Switch>
    );
  }
}
