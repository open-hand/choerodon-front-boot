import React, { Component } from 'react';
import { get } from 'mobx';
import { observer, Provider } from 'mobx-react';
import omit from 'lodash/omit';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import esModule from './esModule';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import AsyncCmpWrap from './AsyncCmpWrap';
import stores from '../../stores';

const { MenuStore } = stores;

const refreshKey = '__refresh__';

export default function asyncRouter(getComponent, getInjects, extProps = {}) {
  class AsyncRoute extends Component {
    state = {
      Cmp: null,
      injects: {},
    };

    initKey = Date.now();

    cacheKey = extProps[refreshKey] ? null : this.props.history.location.pathname;

    componentWillUnmountSubject = new Subject();

    componentWillMount() {
      const subject = this.componentWillUnmountSubject;
      const streams = [];
      if (getComponent) {
        streams.push(
          Observable.fromPromise(getComponent())
            .map(esModule)
            .takeUntil(subject),
        );
      }
      if (getInjects) {
        if (typeof getInjects === 'function') {
          streams.push(
            Observable.fromPromise(getInjects())
              .map(esModule)
              .map((inject) => {
                if (inject.getStoreName) {
                  return { [inject.getStoreName()]: inject };
                }
                return {};
              })
              .takeUntil(subject),
          );
        } else if (typeof getInjects === 'object') {
          Object.keys(getInjects).forEach((key) => {
            streams.push(
              Observable.fromPromise(getInjects[key]())
                .map(esModule)
                .map(inject => ({ [key]: inject }))
                .takeUntil(subject),
            );
          });
        }
      }
      if (streams.length > 0) {
        Observable.zip(...streams)
          .takeUntil(subject)
          .subscribe(([Cmp, ...injects]) => {
            this.setState({ Cmp, injects });
            subject.unsubscribe();
          });
      }
    }

    componentWillUnmount() {
      const subject = this.componentWillUnmountSubject;
      if (subject && !subject.closed) {
        subject.next();
        subject.unsubscribe();
      }
    }

    renderChild = () => {
      const { Cmp, injects } = this.state;
      return <Cmp {...omit(extProps, [refreshKey, 'axios'])} {...this.props} {...Object.assign({}, ...injects)} key={this.initKey} />;
    };

    render() {
      const { Cmp } = this.state;
      const key = MenuStore.contentKeys ? get(MenuStore.contentKeys, this.cacheKey) : undefined;
      const props = {
        shouldUpdate: extProps[refreshKey],
      };
      if (key && key !== this.initKey) {
        this.initKey = key;
        props.shouldUpdate = true;
      }
      let axiosProps = {};
      if (extProps.axios) {
        axiosProps = { axios: extProps.axios };
      }
      return Cmp && (
        <AsyncCmpWrap {...props}>
          <Provider {...axiosProps}>
            {this.renderChild()}
          </Provider>
        </AsyncCmpWrap>
      );
    }
  }

  return observer(AsyncRoute);
}
