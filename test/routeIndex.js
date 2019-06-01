import React, { Component } from 'react';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import asyncRouter from '../src/containers/components/util/asyncRouter';
import { nomatch } from '../src/containers/components';

const Permission = asyncRouter(() => import('./workspace'));

export default ({ match }) => (
  <CacheSwitch>
    <CacheRoute exact path={`${match.url}/permission`} cacheKey={`${match.url}/permission`} component={Permission} />
    <CacheRoute path="*" component={nomatch} />
  </CacheSwitch>
);
