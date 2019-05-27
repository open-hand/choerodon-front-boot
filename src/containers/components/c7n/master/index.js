import React from 'react';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { inject, observer } from 'mobx-react';
import { Spin } from 'choerodon-ui';
import Master from './Master';
import asyncRouter from '../../util/asyncRouter';
import PermissionProvider from '../permission/PermissionProvider';
import asyncLocaleProvider from '../../util/asyncLocaleProvider';
import { authorizeC7n, getAccessToken, setAccessToken, dashboard, WEBSOCKET_SERVER } from '../../../common';
import WSProvider from '../ws/WSProvider';
import './index.scss';

@withRouter
@inject('AppState')
@observer
export default class Index extends React.Component {
  render() {
    return (
      <PermissionProvider>
        <WSProvider server={WEBSOCKET_SERVER}>
          <Master
            AutoRouter={this.props.AutoRouter}
            GuideRouter={this.props.GuideRouter}
            dashboard={dashboard}
            UserMaster={this.props.UserMaster}
          />
        </WSProvider>
      </PermissionProvider>
    );
  }
}
