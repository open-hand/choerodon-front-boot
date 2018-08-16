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
    static Message = null;

    static needLoadLocaleData = true && getLocaleData;

    static LocaleData = null;

    state = {
      Message: AsyncLocaleProvider.Message,
      LocaleData: AsyncLocaleProvider.LocaleData,
      needLoadLocaleData: AsyncLocaleProvider.needLoadLocaleData,
    };

    componentWillMount() {
      const { Message, LocaleData, needLoadLocaleData } = this.state;

      if (!Message || (needLoadLocaleData && !LocaleData)) {
        this.componentWillUnmountSubject = new Subject();

        const streams = [
          Message
            ? Observable.of(Message)
              .takeUntil(this.componentWillUnmountSubject)
            : Observable.fromPromise(getMessage())
              .map(esModule)
              .map((message) => {
                AsyncLocaleProvider.Message = message;
                return message;
              })
              .takeUntil(this.componentWillUnmountSubject),
        ];

        if (getLocaleData) {
          streams.push(
            needLoadLocaleData && LocaleData
              ? Observable.of(LocaleData)
                .takeUntil(this.componentWillUnmountSubject)
              : Observable.fromPromise(getLocaleData())
                .map(esModule)
                .takeUntil(this.componentWillUnmountSubject),
          );
        }

        Observable.zip(...streams)
          .takeUntil(this.componentWillUnmountSubject)
          .subscribe(([message, localeData]) => {
            if (this.mounted) {
              this.setState({ Message: message, LocaleData: localeData });
            } else {
              this.state.Message = message;
              this.state.LocaleData = localeData;
            }

            this.componentWillUnmountSubject.unsubscribe();
          });
      }
    }

    componentDidMount() {
      this.mounted = true;
    }

    componentWillUnmount() {
      if (this.componentWillUnmountSubject && !this.componentWillUnmountSubject.closed) {
        this.componentWillUnmountSubject.next();
        this.componentWillUnmountSubject.unsubscribe();
      }
    }

    render() {
      const { Message, LocaleData, needLoadLocaleData } = this.state;
      if (needLoadLocaleData) {
        if (!LocaleData) {
          return null;
        } else {
          addLocaleData(LocaleData);
        }
      }
      return Message ? <IntlProvider {...this.props} locale={locale.replace('_', '-')} messages={Message} /> : null;
    }
  };
}
