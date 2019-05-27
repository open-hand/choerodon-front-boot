import AppStatePro from './pro/AppState';
import MenuStorePro from './pro/MenuStore';
import HeaderStorePro from './pro/HeaderStore';
import AppState from './c7n/AppState';
import HeaderStore from './c7n/HeaderStore';
import MenuStore from './c7n/MenuStore';
import GuideStore from './c7n/GuideStore';
import DashboardStore from './c7n/DashboardStore';
import FavoritesStore from './c7n/FavoritesStore';
import { TYPE } from '../common/constants';
import { dashboard } from '../common';

const stores = {};
if (TYPE === 'choerodon') {
  stores.AppState = AppState;
  stores.MenuStore = MenuStore;
  stores.HeaderStore = HeaderStore;
  stores.GuideStore = GuideStore;
  stores.FavoritesStore = FavoritesStore;
  if (dashboard) {
    stores.DashboardStore = DashboardStore;
  }
}
if (TYPE === 'hap') {
  stores.AppState = AppStatePro;
  stores.MenuStore = MenuStorePro;
  stores.HeaderStore = HeaderStorePro;
}

export default stores;
