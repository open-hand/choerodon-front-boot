import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { nomatch } from '../lib/containers/components';
import asyncRouter from '../lib/containers/components/util/asyncRouter';

const Home = asyncRouter(() => import('../lib/containers/components/home'));

export default class AutoRouter extends Component {
  static getStoreName() {
    return 'AutoRouter';
  }

  render() {
    return (
      <Switch>
        <Route exact path='/' component={Home} />
        [routes]
        <Route path={'*'} component={nomatch} />
      </Switch>
    );
  }
};
