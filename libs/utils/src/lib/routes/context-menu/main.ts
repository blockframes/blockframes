
// common
import * as common from './common/common';

// app
import * as catalogMarketplace from './app/catalog-marketplace';
import * as delivery from './app/delivery';

import { ctxMenu } from './helpers';

export const CONTEXT_MENU = ctxMenu([
  ...common.CONTEXT_MENU,
  ...catalogMarketplace.baseMenu,
  ...delivery.baseMenu,
]);
