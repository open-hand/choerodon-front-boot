/**
 * Created by jaywoods on 2017/6/23.
 */
/*eslint-disable*/
import React, { Component, Children } from 'react';
import { observer, inject } from 'mobx-react';
import { Spin } from 'antd';
import AppState from 'AppState';

@inject('AppState')
@observer
class IsAuthSpin extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div>
        {AppState.isAuth ? Children.only(this.props.children) : <Spin
              style={{
                marginTop: 300,
                display: 'inherit',
                marginLeft: '50%',
                marginRight: 'auto',
              }}
            />}
      </div>
    );
  }
}

export default IsAuthSpin;
