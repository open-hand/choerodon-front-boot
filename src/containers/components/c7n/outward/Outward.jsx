import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { authorize } from '../../../common';
import asyncRouter from '../../util/asyncRouter';
import asyncLocaleProvider from '../../util/asyncLocaleProvider';
import './style';
import AppState from '../../../stores/c7n/AppState';
import { OUTWARD } from '../../../common/constants';

const OUTWARD_ARR = OUTWARD === 'undefined' ? [] : OUTWARD.split(',');
const outwardPath = ['/organization/register-organization', '/organization/register-organization/agreement'];
@withRouter
@inject('AppState')
@observer
class Outward extends Component {
  componentDidMount() {
    if (!AppState.siteInfo.systemTitle) {
      this.initFavicon();
    }
  }

  initFavicon() {
    AppState.loadSiteInfo().then((data) => {
      const link = document.createElement('link');
      const linkDom = document.getElementsByTagName('link');
      if (linkDom) {
        for (let i = 0; i < linkDom.length; i += 1) {
          if (linkDom[i].getAttribute('rel') === 'shortcut icon') document.head.removeChild(linkDom[i]);
        }
      }
      link.id = 'dynamic-favicon';
      link.rel = 'shortcut icon';
      link.href = data.favicon || 'favicon.ico';
      document.head.appendChild(link);
      if (data.systemTitle) {
        document.getElementsByTagName('title')[0].innerText = data.systemTitle;
      }
      AppState.setSiteInfo(data);
    });
  }

  render() {
    const { AutoRouter } = this.props;
    const UILocaleProviderAsync = asyncRouter(() => import('choerodon-ui/lib/locale-provider'), {
      locale: () => import(`choerodon-ui/lib/locale-provider/${AppState.currentLanguage}.js`),
    });

    const language = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(
      language,
      () => import(`../../../locale/${language}`),
      () => import(`react-intl/locale-data/${language.split('_')[0]}`),
    );
    const customInner = OUTWARD_ARR.some(v => `#${this.props.location.pathname}`.startsWith(v));
    if (outwardPath.includes(this.props.location.pathname) || customInner) {
      return (
        <UILocaleProviderAsync history={this.props.history}>
          <IntlProviderAsync>
            <div className="page-wrapper">
              <AutoRouter />
            </div>
          </IntlProviderAsync>
        </UILocaleProviderAsync>
      );
    } else {
      authorize();
    }
  }
}

export default Outward;
