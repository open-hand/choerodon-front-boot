import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { authorize } from '../../common';
import './style';

@withRouter
@inject('AppState')
@observer
class Outward extends Component {
  render() {
    const { AutoRouter } = this.props;
    if (this.props.location.pathname === '/iam/outward-register-org') {
      return (
        <div className="page-wrapper">
          <AutoRouter />
        </div>
      );
    } else {
      authorize();
    }
  }
}

export default Outward;
