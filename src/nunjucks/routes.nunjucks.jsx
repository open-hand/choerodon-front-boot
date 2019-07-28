import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';
import { nomatch } from '../{{ source }}/containers/components/index';
import asyncRouter from '../{{ source }}/containers/components/util/asyncRouter';
import asyncModuleWrapper from '../{{ source }}/containers/components/util/asyncModuleWrapper';
import createAxiosInsByModuleName from '../{{ source }}/containers/components/util/createAxiosInsByModuleName';
import IFRAMEINDEX from '../{{ source }}/containers/components/pro/iframeWrapper';
import PROJECTINDEX from '../{{ source }}/containers/components/c7n/projects';
import { dashboard } from '../{{ source }}/containers/common/index';
import { TYPE } from '../{{ source }}/containers/common/constants';
import Dashboard from '{{ dashboardPath }}';

const routes = {};
const CHOERODON_FRONT_BOOT_HOME_PAGE = 'home';

function createRoute(path, component, moduleCode) {
  const getAxios = createAxiosInsByModuleName(moduleCode);
  if (!routes[path]) {
    const Cmp = asyncModuleWrapper(component, null, null, moduleCode, getAxios);
    routes[path] = TYPE === 'choerodon' ? <Route path={path} component={Cmp} /> : <CacheRoute path={path} component={Cmp} />;
  }
  return routes[path];
}

function createHome(path, component, homePath) {
  if (!routes[path]) {
    const injectObj = dashboard ? Dashboard : {};
    const Cmp = asyncRouter(
      // eslint-disable-next-line no-nested-ternary
      homePath
        ? component
        : dashboard 
          ? () => import('../{{ source }}/containers/components/c7n/dashboard')
          : () => import('../{{ source }}/containers/components/pro/home'),
      null,
      {
        // axios: createAxiosInsByModuleName(CHOERODON_HAP_FRONT_BOOT_HOME_PAGE),
        ...injectObj,
        getAxios: createAxiosInsByModuleName,
      },
    );
    routes[path] = TYPE === 'choerodon' ? <Route exact path={path} component={Cmp} /> : <CacheRoute exact path={path} component={Cmp} />;
  }
  return routes[path];
}

const Home = asyncRouter(
  () => import('../{{ source }}/containers/components/pro/home'),
  null,
  {
    // axios: createAxiosInsByModuleName(CHOERODON_HAP_FRONT_BOOT_HOME_PAGE)
    getAxios: createAxiosInsByModuleName,
  },
);

export default class AutoRouter extends Component {
  render() {
    return (
      <CacheSwitch>
        {'{{ home }}'}
        {'{{ routes }}'}
        <Route path="/projects" component={PROJECTINDEX} />
        <CacheRoute path="/iframe/:name" cacheKey="iframe" component={IFRAMEINDEX} /> 
        <CacheRoute path="*" component={nomatch} />
      </CacheSwitch>
    );
  }
}
