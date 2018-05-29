/*eslint-disable*/
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AutoRouter from 'AutoRouter';
import CommonMenu from 'CommonMenu';
import classnames from 'classnames';
import MasterHeader from 'MasterHeader';
import IsAuthSpin from 'IsAuthSpin';
import './Master.scss';

@inject('AppState')
@observer
class Masters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectFlag: true,
      organizationFlag: true,
    };
  }

  render() {
    const classString = classnames('page-wrapper', {
      'single-menu': this.props.AppState.getSingle,
    });
    return (
      <IsAuthSpin>
        <div className={classString}>
          <div className="page-header">
            <MasterHeader />
          </div>
          <div className="page-body">
            <div className="content-wrapper">
              <div id="menu" className="c7n-menu">
                <CommonMenu />
              </div>
              <div id="autoRouter" className="content">
                <AutoRouter />
              </div>
            </div>
          </div>
        </div>
      </IsAuthSpin>
    );
  }
}

export default Masters;
