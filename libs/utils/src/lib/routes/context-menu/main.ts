import * as catalogDashboard from './catalog-dashboard';
import * as catalogMarketplace from './catalog-marketplace';
import * as delivery from './delivery';

export const CONTEXT_MENU = [
  {
    route: 'default',
    items: []
  },
  ...catalogDashboard.CONTEXT_MENU,
  ...catalogMarketplace.CONTEXT_MENU,
  ...delivery.CONTEXT_MENU
];
