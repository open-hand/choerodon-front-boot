import React, { Component, createElement } from 'react';
import { configure } from 'choerodon-ui';
import { UI_CONFIGURE } from '../../../common/constants';
import { dashboard } from '../../../common';
import uiAxios from '../axios/UiAxios';

class Masters extends Component {
  componentDidMount() {
    this.initUiConfigure();
  }

  initUiConfigure = () => {
    const uiConfigure = UI_CONFIGURE || {};
    configure({
      ...uiConfigure,
      axios: uiAxios,
      dataKey: 'list',
      labelLayout: 'float',
      queryBar: 'bar',
      tableBorder: false,
      lookupAxiosMethod: 'get',
    });
  }

  render() {
    const { AutoRouter, GuideRouter, UserMaster } = this.props;
    if (UserMaster) {
      return (
        <UserMaster
          AutoRouter={AutoRouter}
          dashboard={dashboard}
          GuideRouter={GuideRouter}
        />
      );
    }
    return <div>请确保指定了config.js中的master字段。</div>;
  }
}

export default Masters;
