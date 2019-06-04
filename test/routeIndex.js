import React, { Component } from 'react';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import asyncRouter from '../src/containers/components/util/asyncRouter';
import createRouteWrapper from '../src/containers/components/util/createRouteWrapper';
import { nomatch } from '../src/containers/components';

const Permission = asyncRouter(() => import('./workspace'));
const Origin = asyncRouter(() => import('./workspace/Origin'));
const Preview = createRouteWrapper('/hap-core/origin', Origin);

export default ({ match }) => (
  <CacheSwitch>
    <CacheRoute exact path={`${match.url}/permission`} cacheKey={`${match.url}/permission`} component={Permission} />
    <CacheRoute exact path={`${match.url}/origin/:code`} cacheKey={`${match.url}/origin`} component={Preview} />
    <CacheRoute path="*" component={nomatch} />
  </CacheSwitch>
);
