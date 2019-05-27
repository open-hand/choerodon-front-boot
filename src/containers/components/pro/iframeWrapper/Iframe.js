import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

@withRouter
export default class Iframe extends Component {
  render() {
    const { tab, history: { location }, MenuStore } = this.props;
    const url = `${tab.route}${location.search}`;

    return (
      <div style={{ width: '100%', height: 'calc(100vh - 88px)', overflow: 'hidden' }}>
        <iframe
          title="iframe"
          src={url}
          width="100%"
          height="100%"
        />
      </div>
    );
  }
}
