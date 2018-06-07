import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { nomatch } from '../lib/site/components';

export default class RouteIndex extends Component {
  render() {
    return (
      <Switch>
        <Route path={'*'} component={nomatch} />
      </Switch>
    );
  }
}
