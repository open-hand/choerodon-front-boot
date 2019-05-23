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
import './style';

@withRouter
@inject('AppState')
@observer
export default class Index extends React.Component {
  state = {
    loading: true,
  }

  componentDidMount() {
    this.auth();
  }

  async auth() {
    const { AppState } = this.props;
    const { access_token: accessToken, token_type: tokenType, expires_in: expiresIn } = queryString.parse(window.location.hash);
    if (accessToken) {
      setAccessToken(accessToken, tokenType, expiresIn);
      // 去除url中的accessToken
      window.location.href = window.location.href.replace(/[&?]redirectFlag.*/g, '');
    } else if (!getAccessToken()) {
      authorizeC7n();
      return;
    }
    AppState.setUserInfo(await AppState.loadUserInfo());
    this.setState({
      loading: false,
    });
  }

  render() {
    const { loading } = this.state;
    if (loading) {
      return (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, margin: 'auto', width: 30, height: 30 }}>
          <Spin />
        </div>
      );
    }

    const { AppState } = this.props;
    const UILocaleProviderAsync = asyncRouter(() => import('choerodon-ui/lib/locale-provider'), {
      locale: () => import(`choerodon-ui/lib/locale-provider/${AppState.currentLanguage}.js`),
    });

    const language = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(
      language,
      () => import(`../../../locale/${language}`),
      () => import(`react-intl/locale-data/${language.split('_')[0]}`),
    );

    return (
      <UILocaleProviderAsync history={this.props.history}>
        <IntlProviderAsync>
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
        </IntlProviderAsync>
      </UILocaleProviderAsync>
    );
  }
}
