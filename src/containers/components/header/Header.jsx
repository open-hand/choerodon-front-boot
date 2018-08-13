import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import MenuType from './MenuType';
import Logo from './Logo';
import Setting from './Setting';
import UserPreferences from './UserPreferences';
import './style';

@inject('AppState', 'HeaderStore', 'MenuStore')
@observer
class Header extends Component {
  componentDidMount() {
    const { AppState, HeaderStore, MenuStore } = this.props;
    MenuStore.loadMenuData({ type: 'site' }, false);
    HeaderStore.axiosGetOrgAndPro(AppState.getUserId);
  }

  render() {
    const { AppState, MenuStore } = this.props;
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
    let imgUrl;
    const data = AppState.getUserInfo;
    if (data) {
      imgUrl = data.image_url;
    }
    return (
      <div className="master-head-wrap">
        <div className="master-head-left">
          <Logo history={this.props.history} />
        </div>
        <ul className="master-head-center">
          <li className={menuTypeStyle}>
            <MenuType />
          </li>
          {
            MenuStore.getSiteMenuData.length > 0 && (
              <li className={logoStyle}>
                <Setting />
              </li>
            )
          }
        </ul>
        <ul className="master-head-right">
          <li>
            <UserPreferences imgUrl={imgUrl} />
          </li>
        </ul>
      </div>
    );
  }
}

export default Header;
