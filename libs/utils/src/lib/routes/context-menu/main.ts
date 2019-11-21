import * as catalogDashboard from './catalog-dashboard';
import * as catalogMarketplace from './catalog-marketplace';
import * as delivery from './delivery';

import { ctxMenu } from './helpers';

export const CONTEXT_MENU = ctxMenu([
  ...catalogDashboard.baseMenu,
  ...catalogMarketplace.baseMenu,
  ...delivery.baseMenu
]);
