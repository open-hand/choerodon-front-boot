/**
 * Created by smilesoul on 2017/6/23.
 */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import MenuType from 'MenuType';
import LeftIconButton from 'LeftIconButton';
import RightIconButton from 'RightIconButton';
import UserPreferences from 'UserPreferences';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import axios from 'Axios';
import { Button } from 'choerodon-ui';
import HeaderStore from '@/stores/HeaderStore';
import MenuStore from '@/stores/MenuStore';
import './MasterHeader.scss';

const ORGANIZATION_TYPE = 'organization';
const PROJECT_TYPE = 'project';

@inject('AppState')
@observer
class MasterHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectFlag: true,
      organizationFlag: true,
      siteFlag: false,
      orgData: null,
      proData: null,
    };
  }

  componentDidMount() {
    const { AppState } = this.props;
    const userId = AppState.getUserId;
    axios.get(`/iam/v1/users/self`)
      .then(value => {
        MenuStore.loadMenuData('site').then(menus => {
          this.setState({
            siteFlag: menus.length > 0,
          });
        });
        HeaderStore.axiosGetOrgAndPro(value.id || sessionStorage.userId || userId).then((org) => {
          org[0].map(value => {
            value.type = ORGANIZATION_TYPE;
          });
          org[1].map(value => {
            value.type = PROJECT_TYPE;
          });
          HeaderStore.setOrgData(org[0]);
          HeaderStore.setProData(org[1]);
        });
      });
  }

  fetchAxios = (method, url) => {
    return axios[method](url);
  };

  adjustDebugger() {
    const { AppState } = this.props;
    if (AppState.debugger) {
      AppState.setDebugger(false);
    } else {
      AppState.setDebugger(true);
    }
  }

  render() {
    const { AppState } = this.props;
    const type = AppState.getType || sessionStorage.type;
    const menuTypeStyle = classnames({
      'masterHead-hoverMaster': true,
      'masterHead-menuType': true,
      'masterHead-menuType-showBG': type !== 'site',
      'masterHead-menuType-hideBG': type === 'site',
    });
    const logoStyle = classnames({
      'masterHead-hoverMaster': true,
      'masterHead-logo-wrap': true,
      'masterHead-menuType-showBG': type === 'site',
      'masterHead-menuType-hideBG': type !== 'site',
    });
    let version;
    const local = process.env.LOCAL;
    if (JSON.parse(local)) {
      version = '本地';
    } else {
      version = process.env.VERSION || '本地';
    }
    let imgUrl;
    const data = AppState.getUserInfo;
    if (data) {
      imgUrl = data.image_url;
    }
    const styles = {
      appBar: {
        backgroundColor: Choerodon.setTheme('header') || '#FFFFFF',
        // Needed to overlap the examples
      },
    };
    return (
      <div className="master-head-wrap" style={styles.appBar}>
        <div className="master-head-left">
          <LeftIconButton history={this.props.history} />
        </div>
        <ul className="master-head-center">
          <li className={menuTypeStyle}>
            <MenuType />
          </li>
          {
            this.state.siteFlag && (
              <li className={logoStyle}>
                <RightIconButton />
              </li>
            )
          }
        </ul>
        <ul className="master-head-right">
          <li>
            {AppState.debugger ? <div>{version}</div> : <div />}
          </li>
          {
            /*<li>
              <Tooltip placement="bottom" title={Choerodon.getMessage('调试', 'debug')}>
                <Button icon="developer_mode" funcType="flat" shape="circle" onClick={this.adjustDebugger.bind(this)} />
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="bottom" title={Choerodon.getMessage('全屏', 'fullScreen')}>
                <Button icon="zoom_out_map" funcType="flat" shape="circle" onClick={() => Choerodon.fullscreen()} />
              </Tooltip>
            </li>*/
          }
          <li>
            <UserPreferences imgUrl={imgUrl} />
          </li>
        </ul>
      </div>
    );
  }
}

export default MasterHeader;
