import React from 'react';
import { inject, observer } from 'mobx-react';
import { HashRouter } from 'react-router-dom';

@observer
export default class Index extends React.Component {
  render() {
    const { AutoRouter } = this.props;
    return (
      <HashRouter>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: 'calc(100%)', overflow: 'auto' }}>
                <AutoRouter />
              </div>
            </div>
          </div>
        </div>
      </HashRouter>
    );
  }
}
