import React, { Component, createElement } from 'react';
import { configure } from 'choerodon-ui';
import { UI_CONFIGURE, CUSTOM_THEME_COLOR } from '../../../common/constants';
import { dashboard } from '../../../common';
import uiAxios from '../axios/UiAxios';
import themeColorClient from './themeColorClient';

class Masters extends Component {
  state = {
    loading: true,
  };

  componentDidMount() {
    this.initUiConfigure();
    this.updateTheme(CUSTOM_THEME_COLOR);
  }

  updateTheme = (newPrimaryColor) => {
    if (newPrimaryColor === 'undefined' || !newPrimaryColor) {
      this.setState({ loading: false });
      return;
    }
    const colorArr = newPrimaryColor.split(',');
    let c1; let c2;
    if (colorArr.length === 2) {
      [c1, c2] = colorArr;
    } else if (colorArr.length === 1) {
      // eslint-disable-next-line prefer-destructuring
      c1 = colorArr[0];
      // eslint-disable-next-line prefer-destructuring
      c2 = colorArr[0];
    } else if (!colorArr.length) {
      return;
    }
    themeColorClient.changeColor(c1, c2)
      .finally(() => {
        this.setState({
          loading: false,
        });
        // eslint-disable-next-line no-console
        console.log(`[choerodon] Current Theme Color: ${newPrimaryColor}`)
      });
  };

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
      tableHighLightRow: false,
      tableRowHeight: 32,
      tableColumnResizable: false,
    });
  }

  render() {
    const { loading } = this.state;
    if (loading) {
      return null;
    }
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
