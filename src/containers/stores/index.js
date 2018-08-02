import AppState from './AppState';
import HeaderStore from './HeaderStore';
import MenuStore from './MenuStore';
import PermissionStore from './PermissionStore';
import DashboardStore from './DashboardStore';
import { dashboard } from '../common';

const stores = {
  AppState,
  HeaderStore,
  MenuStore,
  PermissionStore,
};
if (dashboard) {
  stores.DashboardStore = DashboardStore;
}

export default stores;
