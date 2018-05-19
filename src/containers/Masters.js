/*eslint-disable*/
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Tooltip } from 'antd';
import AutoRouter from 'AutoRouter';
import menuStore from 'menuStore';
import CommonMenu from 'CommonMenu';
import classnames from 'classnames';

import MasterHeader from 'MasterHeader';
import './Master.scss';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

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

  componentDidMount() {
    const { AppState } = this.props;
    AppState.loadUserInfo();
    // document.getElementById('autoRouter').style.height = `${window.innerHeight - 48}px`;
    // window.addEventListener('resize', this.ChangeContent.bind(this));
    // const el = document.getElementById('autoRouter');
    // document.addEventListener('keyup', (e) => {
    //   if (e.which === 27) {
    //     el.style.position = 'absolute';
    //   }
    // });
  }

  componentWillUnmount() {
    // window.removeEventListener('resize', this.ChangeContent.bind(this));
  }


  ChangeContent() {
    if (this.content) {
      this.content.style.height = `${window.innerHeight - 48}px`;
    }
  }

  Content(instance) {
    this.content = instance;
  }

  render() {
    const classString = classnames('page-wrapper', {
      'single-menu': this.props.AppState.getSingle,
    });
    return (
      <div className={classString}>
        <div className="page-header">
          <MasterHeader />
        </div>
        <div className="page-body">
          <div className="content-wrapper">
            <div id="menu" className="c7n-menu">
              <CommonMenu />
            </div>
            <div id="autoRouter" className="content" ref={this.Content.bind(this)}>
              <AutoRouter />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Masters;
