/**
 * Created by laincarl on 2017/10/31.
 */
/*eslint-disable*/
import React, { Component } from 'react';
import { Menu, Icon, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Routes from 'RouteMap';
import _ from 'lodash';

const SubMenu = Menu.SubMenu;

@inject('AppState')
@observer
class CommonMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillMount() {

  }


  render() {
    const { AppState } = this.props;

    return (
      <div>
        heello
      </div>
    );
  }
}

export default withRouter(CommonMenu);
