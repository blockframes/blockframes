import { appsRoute } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';
import { ctxMenu } from '../helpers';

// common
import * as common from '../common/common';

export const baseRoute = `${appsRoute}/${App.catalogDashboard}`;

export const baseMenu = [
  {
    route: baseRoute,
    items: [
      {
        name: 'movie list',
        path: `${baseRoute}/home/list`
      }, // temp
      {
        name: 'Upload avails & films doc',
        path: `${baseRoute}/import`
      }, // temp until good place for this route is found
      {
        name: 'New Deals',
        path: 'https://projects.invisionapp.com/share/KWTO3NFHQCZ#/screens/381254658',
        external: true
      },
      {
        name: 'Sales',
        path: 'https://projects.invisionapp.com/share/KWTO3NFHQCZ#/screens/381254662',
        external: true
      }
    ]
  }
];

export const CONTEXT_MENU = ctxMenu([
  ...common.CONTEXT_MENU,
  ...baseMenu
]);
