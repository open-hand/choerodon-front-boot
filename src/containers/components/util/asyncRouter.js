/*eslint-disable*/
import React, { Component, PropTypes } from 'react';
import { isArray } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import esModule from './esModule';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';

export default function asyncRouter(getComponent, getInjects) {
  return class AsyncRoute extends Component {

    state = {
      Component: null,
      injects: {},
    };

    _componentWillUnmountSubject = new Subject();

    componentWillMount() {
      const subject = this._componentWillUnmountSubject;
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
              .map(inject => {
                if (inject.getStoreName) {
                  return { [inject.getStoreName()]: inject };
                }
                return {};
              })
              .takeUntil(subject),
          );
        } else if (typeof getInjects === 'object') {
          Object.keys(getInjects).forEach(key => {
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
          .subscribe(([Component, ...injects]) => {
            this.setState({ Component, injects });
            subject.unsubscribe();
          });
      }
    }

    componentWillUnmount() {
      const subject = this._componentWillUnmountSubject;
      if (subject && !subject.closed) {
        subject.next();
        subject.unsubscribe();
      }
    }

    render() {
      const { Component, injects } = this.state;

      return Component && <Component {...Object.assign({}, this.props, ...injects)} />;
    }
  };
}
