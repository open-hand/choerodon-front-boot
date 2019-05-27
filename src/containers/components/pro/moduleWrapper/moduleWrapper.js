import React, { Component } from 'react';
import getIntlManager from '../masterPro/IntlManager';
import Axios from '../axios';
import { TYPE } from '../../../common/constants';

export default class ModuleWrapper extends Component {
  state = {
    loading: true,
  };

  componentDidMount() {
    if (TYPE === 'hap') {
      this.registryIntl();
    }
  }

  async registryIntl() {
    const { moduleCode } = this.props;
    const intlManager = getIntlManager();
    
    this.setState({ loading: true });
    try {
      const res = await Axios.post(`/common/prompt/${moduleCode}`, {});
      intlManager.add(res || {});
    } catch (error) {
      intlManager.add({});
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading } = this.state;
    const { children } = this.props;

    if (TYPE === 'choerodon') {
      return children;
    }

    return loading ? null : children;
  }
}
