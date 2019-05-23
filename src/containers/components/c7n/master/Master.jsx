import React, { Component, createElement } from 'react';
import { dashboard } from '../../../common';

class Masters extends Component {
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
