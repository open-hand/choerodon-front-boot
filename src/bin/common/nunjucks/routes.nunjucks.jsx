import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { nomatch } from './transfer.index.js';

const routes = {};

function createRoute(path, component, moduleCode) {
  if (!routes[path]) {
    routes[path] = <Route path={path} component={React.lazy(component)} />;
  }
  return routes[path];
}

function createHome(path, component, homePath) {
  if (!routes[path]) {
    const Cmp = React.lazy(
      // eslint-disable-next-line no-nested-ternary
      homePath
        ? component
        : () => import('../{{ source }}/containers/home'),
    );
    routes[path] = <Route exact path={path} component={Cmp} />;
  }
  return routes[path];
}

const AutoRouter = () => (
  <Suspense fallback={<span />}>
    <CacheSwitch>
      {'{{ home }}'}
      {'{{ routes }}'}
      <CacheRoute path="*" component={nomatch} />
    </CacheSwitch>
  </Suspense>
);

export default AutoRouter;
