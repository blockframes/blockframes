
// common
import * as common from './common/common';

// app
import * as catalogDashboard from './app/catalog-dashboard';
import * as catalogMarketplace from './app/catalog-marketplace';
import * as delivery from './app/delivery';

import { ctxMenu } from './helpers';

export const CONTEXT_MENU = ctxMenu([
  ...common.CONTEXT_MENU,
  ...catalogDashboard.baseMenu,
  ...catalogMarketplace.baseMenu,
  ...delivery.baseMenu,
]);
