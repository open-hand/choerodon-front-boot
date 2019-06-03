import React from 'react';
import Menu from '../menu';
import Tabbar from '../tabbar';
import Header from '../header';

class MasterProDefault extends React.Component {
  render() {
    const { AutoRouter } = this.props;
    const originMaster = [
      <Header />,
      <div className="master-body">
        <div className="master-content-wrapper">
          <Menu />
          <div className="master-content-container">
            <div className="master-container">
              <Tabbar />
              <div className="master-content">
                <AutoRouter />
              </div>
            </div>
          </div>
        </div>
      </div>,
    ];
    return originMaster;
  }
}

export default MasterProDefault;
