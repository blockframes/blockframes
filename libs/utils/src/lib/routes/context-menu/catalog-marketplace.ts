import { appsRoute } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';
import { ctxMenu } from './helpers';

export const baseRoute = `${appsRoute}/${App.biggerBoat}`;

export const baseMenu = [
  {
    route: 'default',
    items: [
      {
        name: 'home',
        path: `${baseRoute}/home`,
        icon: 'home_sidebar'
      },
      {
        name: 'Line-up',
        path: `${baseRoute}/search`,
        icon: 'search_sidebar'
      }
    ]
  },
  {
    route: '/layout/organization/home',
    items: []
  },
  {
    route: '/layout/organization/create',
    items: []
  },
  {
    route: '/layout/organization/find',
    items: []
  },
  {
    route: '/layout/organization/congratulations',
    items: []
  }
];

export const CONTEXT_MENU = ctxMenu(baseMenu);

export const baseMenuAfm = [ // TODO #1146
  {
    route: 'default',
    items: [
      {
        name: 'home',
        path: `${baseRoute}/home`,
        icon: 'home_sidebar'
      },
      {
        name: 'Line-up',
        path: `${baseRoute}/search`,
        icon: 'search_sidebar'
      }
    ]
  },
  {
    route: '/layout/organization/home',
    items: []
  },
  {
    route: '/layout/organization/create',
    items: []
  },
  {
    route: '/layout/organization/find',
    items: []
  },
  {
    route: '/layout/organization/congratulations',
    items: []
  }
];

export const CONTEXT_MENU_AFM = ctxMenu(baseMenuAfm);
