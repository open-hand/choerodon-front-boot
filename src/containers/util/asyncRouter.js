import React, { Component } from 'react';
import esModule from './esModule';

function transformInjects(getInjects, inject) {
  if (!getInjects) {
    return {};
  }
  if (typeof getInjects === 'function' && inject[0].getStoreName) {
    return { [inject[0].getStoreName()]: inject[0] };
  } else if (typeof getInjects === 'object') {
    const result = {};
    Object.keys(getInjects).forEach((key, i) => {
      result[key] = inject[i];
    });
    return result;
  }
  return {};
}
function getInjectDataFetchers(getInjects) {
  if (!getInjects) {
    return [];
  }
  if (typeof getInjects === 'function') {
    return [getInjects()];
  } else if (typeof getInjects === 'object') {
    return Object.keys(getInjects).map((key) => getInjects[key]());
  }
}
export default function asyncRouter(getComponent, getInjects, extProps, callback) {
  return class AsyncRoute extends Component {
    constructor() {
      super();
      this.state = {
        Cmp: null,
        injects: {},
      };
    }

    loadData = async () => {
      const injectDataFetchers = getInjectDataFetchers(getInjects);
      const [componentData, ...injectData] = await Promise.all([
        getComponent ? getComponent() : null,
        ...injectDataFetchers,
      ]);
      this.setState({
        Cmp: esModule(componentData),
        injects: transformInjects(getInjects, esModule(injectData)),
      }, callback);
    }

    componentDidMount() {
      this.loadData();
    }

    render() {
      const { Cmp, injects } = this.state;
      // eslint-disable-next-line react/jsx-props-no-spreading
      return Cmp && <Cmp {...({ ...extProps, ...this.props, ...injects })} />;
    }
  };
}
