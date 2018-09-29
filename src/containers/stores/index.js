import AppState from './AppState';
import HeaderStore from './HeaderStore';
import MenuStore from './MenuStore';
import DashboardStore from './DashboardStore';
import { dashboard } from '../common';

const stores = {
  AppState,
  HeaderStore,
  MenuStore,
};
if (dashboard) {
  stores.DashboardStore = DashboardStore;
}

export default stores;
