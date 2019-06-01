import React from 'react';
import { inject, observer } from 'mobx-react';
import { HashRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import 'moment/locale/zh-cn';
import SockJS from 'sockjs-client';
import { localeContext, ModalContainer } from 'choerodon-ui/pro';
import Header from '../../src/containers/components/pro/header';
import Menu from '../../src/containers/components/pro/menu';
import '../../src/containers/components/pro/masterPro/style';

@observer
export default class Index extends React.Component {
  render() {
    const { AutoRouter } = this.props;
    return (
      <div className="master-wrapper">
        {/* <Header /> */}
        <div className="master-body">
          <div className="master-content-wrapper">
            <Menu />
            <div className="master-content-container">
              <div className="master-container">
                <div className="master-content">
                  <AutoRouter />
                </div>
              </div>
            </div>
          </div>
        </div>
        <ModalContainer />
      </div>
    );
  }
}
