import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import esModule from './esModule';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import ModuleWrapper from '../pro/moduleWrapper';

export default function asyncModuleWrapper(getComponent, getInjects, extProps, moduleCode, getAxios) {
  return class AsyncModuleWrapper extends Component {
    state = {
      Cmp: null,
      injects: {},
    };

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

    render() {
      const { Cmp, injects } = this.state;

      return Cmp ? (
        <ModuleWrapper moduleCode={moduleCode}>
          <Provider getAxios={getAxios}>
            <Cmp {...Object.assign({}, extProps, this.props, ...injects)} />
          </Provider>
        </ModuleWrapper>
      ) : null;
    }
  };
}
