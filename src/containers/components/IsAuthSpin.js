/**
 * Created by jaywoods on 2017/6/23.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Spin } from 'choerodon-ui';

const spinStyle = {
  textAlign: 'center',
  paddingTop: 300,
};

@inject('AppState')
@observer
class IsAuthSpin extends Component {
  render() {
    const { AppState, children } = this.props;
    return (
      AppState.isAuth ? children : <div style={spinStyle}><Spin /></div>
    );
  }
}

export default IsAuthSpin;
