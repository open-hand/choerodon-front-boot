import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Link, withRouter } from 'react-router-dom';
import { observable, action, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import Cmp from './Cmp';
import { TYPE, AUTH_HOST } from '../../src/containers/common/constants';
import { openTabR } from '../../src/containers/components';

@inject('getAxios', 'AppState', 'MenuStore')
export default class App extends Component {
  constructor(props) {
    super(props);

    props.cacheLifecycles.didRecover(this.componentDidRecover);
  }

  componentDidRecover = () => {
    // console.log('List recovered');
  }

  componentDidMount() {
    const axios = this.props.getAxios();
    axios.get('/hafjsl');
    // console.log(TYPE);
    // console.log(AUTH_HOST);
  }

  render() {
    return (
      <div>
        <Button>click</Button>
      </div>
    );
  }
}
