/*eslint-disable*/
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
        this._componentWillUnmountSubject = new Subject();

        const streams = [
          Message
            ? Observable.of(Message)
              .takeUntil(this._componentWillUnmountSubject)
            : Observable.fromPromise(getMessage())
              .map(esModule)
              .map(Message => {
                AsyncLocaleProvider.Message = Message;
                return Message;
              })
              .takeUntil(this._componentWillUnmountSubject),
        ];

        if (getLocaleData) {
          streams.push(
            needLoadLocaleData && LocaleData
              ? Observable.of(LocaleData)
                .takeUntil(this._componentWillUnmountSubject)
              : Observable.fromPromise(getLocaleData())
                .map(esModule)
                .map(LocaleData => {
                  return LocaleData;
                })
                .takeUntil(this._componentWillUnmountSubject),
          );
        }

        Observable.zip(...streams)
          .takeUntil(this._componentWillUnmountSubject)
          .subscribe(([Message, LocaleData]) => {
            if (this._mounted) {
              this.setState({ Message, LocaleData });
            } else {
              this.state.Message = Message;
              this.state.LocaleData = LocaleData;
            }

            this._componentWillUnmountSubject.unsubscribe();
          });
      }
    }

    componentDidMount() {
      this._mounted = true;
    }

    componentWillUnmount() {
      if (this._componentWillUnmountSubject && !this._componentWillUnmountSubject.closed) {
        this._componentWillUnmountSubject.next();
        this._componentWillUnmountSubject.unsubscribe();
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
