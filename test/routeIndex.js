import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { noaccess, nomatch } from '../src/containers/components';

export default class RouteIndex extends Component {
  render() {
    return (
      <Switch>
        <Route path="/" component={noaccess} />
        <Route path="*" component={nomatch} />
      </Switch>
    );
  }
}
