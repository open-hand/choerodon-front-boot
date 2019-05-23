import React, { Component } from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import esModule from './esModule';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';

export default function asyncLocaleProvider(locale, getMessage, getLocaleData) {
  return class AsyncLocaleProvider extends Component {
    state = {
      message: null,
      localeData: null,
    };

    componentWillUnmountSubject = new Subject();

    componentWillMount() {
      const subject = this.componentWillUnmountSubject;
      const streams = [];
      if (getMessage) {
        streams.push(
          Observable.fromPromise(getMessage())
            .map(esModule)
            .takeUntil(subject),
        );
      }
      if (getLocaleData) {
        streams.push(
          Observable.fromPromise(getLocaleData())
            .map(esModule)
            .takeUntil(subject),
        );
      }
      if (streams.length > 0) {
        Observable.zip(...streams)
          .takeUntil(subject)
          .subscribe(([messages, localeData]) => {
            if (localeData) {
              addLocaleData(localeData);
            }
            this.setState({ messages, localeData });
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
      const { messages } = this.state;
      return messages ? <IntlProvider {...this.props} locale={locale.replace('_', '-')} messages={messages} /> : null;
    }
  };
}
