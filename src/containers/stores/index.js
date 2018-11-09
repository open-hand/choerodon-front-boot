import AppState from './AppState';
import HeaderStore from './HeaderStore';
import MenuStore from './MenuStore';
import GuideStore from './GuideStore';
import DashboardStore from './DashboardStore';
import FavoritesStore from './FavoritesStore';
import { dashboard } from '../common';

const stores = {
  AppState,
  HeaderStore,
  MenuStore,
  GuideStore,
  FavoritesStore,
};
if (dashboard) {
  stores.DashboardStore = DashboardStore;
}

export default stores;
