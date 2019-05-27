import React, { Component } from 'react';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import asyncRouter from '../src/containers/components/util/asyncRouter';
import { nomatch } from '../src/containers/components';
import createRouteWrapper from '../src/containers/components/util/createRouteWrapper';

const Language = asyncRouter(() => import('./language'));
const OrgUnit = asyncRouter(() => import('./org-unit'));
const Props = asyncRouter(() => import('./yan'));
const HotKey = asyncRouter(() => import('./hotkey'));
const Hk = createRouteWrapper('test/hotkey', HotKey);

export default ({ match }) => (
  <CacheSwitch>
    <CacheRoute exact path={`${match.url}/hr/orgunit`} cacheKey={`${match.url}/hr/orgunit`} component={OrgUnit} />
    <CacheRoute exact path={`${match.url}/prompt`} cacheKey={`${match.url}/sys/prompt`} component={Language} />
    <CacheRoute exact path={`${match.url}/hotkey/:id`} cacheKey={`${match.url}/hotkey/:id`} component={Hk} />
    <CacheRoute exact path={`${match.url}/hr/position`} cacheKey={`${match.url}/hr/position`} component={Props} />
    <CacheRoute path="*" component={nomatch} />
  </CacheSwitch>
);
