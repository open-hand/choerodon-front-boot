import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { authorize } from '../../common';
import './style';
import AppState from '../../stores/AppState';

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
    if (this.props.location.pathname === '/organization/register-organization') {
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
