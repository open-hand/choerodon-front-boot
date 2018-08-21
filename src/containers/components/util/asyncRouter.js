import React, { Component } from 'react';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import esModule from './esModule';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';

export default function asyncRouter(getComponent, getInjects, extProps) {
  return class AsyncRoute extends Component {
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

      return Cmp && <Cmp {...Object.assign({}, extProps, this.props, ...injects)} />;
    }
  };
}
