/*eslint-disable*/
import React, { Component, PropTypes } from 'react'
import { isArray } from 'lodash'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/observable/zip'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/fromPromise'

const moduleDefaultExport = module => module.default || module;

function esModule(module, forceArray) {
  if (isArray(module)) {
    return module.map(moduleDefaultExport)
  }

  const defualted = moduleDefaultExport(module);
  return forceArray ? [defualted] : defualted
}

export default function asyncRoute(getComponent, getStores) {
  return class AsyncRoute extends Component {

    static Component = null;
    static needLoadStores = true && getStores
    static Stores = null;

    state = {
      Component: AsyncRoute.Component,
      Stores: AsyncRoute.Stores,
      needLoadStores: AsyncRoute.needLoadStores
    };

    componentWillMount() {
      const { Component, Stores, needLoadStores } = this.state;
      if (!Component || (needLoadStores && !Stores)) {
        this._componentWillUnmountSubject = new Subject();

        const streams = [
          Component
            ? Observable.of(Component)
              .takeUntil(this._componentWillUnmountSubject)
            : Observable.fromPromise(getComponent())
              .map(esModule)
              .map(Component => {
                AsyncRoute.Component = Component;
                return Component
              })
              .takeUntil(this._componentWillUnmountSubject)
        ];

        if (getStores) {
          streams.push(
            needLoadStores && Stores
              ? Observable.of(Stores)
                .takeUntil(this._componentWillUnmountSubject)
              : Observable.fromPromise(getStores())
                .map(module => esModule(module, true))
                .map(stores => {
                  return stores;
                })
                .takeUntil(this._componentWillUnmountSubject)
          )
        }

        Observable.zip(...streams)
          .takeUntil(this._componentWillUnmountSubject)
          .subscribe(([Component, Stores]) => {
            if (this._mounted) {
              this.setState({ Component, Stores })
            } else {
              this.state.Component = Component;
              this.stateStores = Stores
            }

            this._componentWillUnmountSubject.unsubscribe()
          })
      }
    }

    componentDidMount() {
      this._mounted = true
    }

    componentWillUnmount() {
      if (this._componentWillUnmountSubject && !this._componentWillUnmountSubject.closed) {
        this._componentWillUnmountSubject.next();
        this._componentWillUnmountSubject.unsubscribe()
      }
    }

    render() {
      const { Component, Stores, needLoadStores } = this.state;
      if (needLoadStores && !Stores)
        return null;
      const storeMap = (Stores || []).reduce(function (map, store) {
        map[store.getStoreName()] = store;
        return map;
      }, {});

      return Component ? <Component {...Object.assign({}, this.props, storeMap) } /> : null
    }
  }
}
