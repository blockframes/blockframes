import { appsRoute } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';

const baseRoute = `${appsRoute}/${App.biggerBoat}`;

export const CONTEXT_MENU = [
  {
    route: 'default',
    items: []
  },
  {
    route: `${baseRoute}/home`,
    items: [
      {
        name: 'home',
        path: `${baseRoute}/home`
      },
      {
        name: 'Line-up',
        path: `${baseRoute}/search`
      },
      {
        name: 'wishlist',
        path: `${baseRoute}/wishlist/overview`
      }
    ]
  },
  {
    route: `${baseRoute}/search`,
    items: [
      {
        name: 'home',
        path: `${baseRoute}/home`
      },
      {
        name: 'Line-up',
        path: `${baseRoute}/search`
      },
      {
        name: 'wishlist',
        path: `${baseRoute}/wishlist/overview`
      }
    ]
  },
  {    // TODO issue#1146
    route: `${baseRoute}/wishlist/overview`,
    items: [
      {
        name: 'home',
        path: `${baseRoute}/home`
      },
      {
        name: 'Line-up',
        path: `${baseRoute}/search`
      },
      {
        name: 'wishlist',
        path: `${baseRoute}/wishlist/overview`
      }
    ]
  },
  {
    route: `${baseRoute}/:movieId/create`,
    items: [
      {
        name: 'view',
        path: `${baseRoute}/:movieId/view`
      },
      {
        name: 'create',
        path: `${baseRoute}/:movieId/create`
      }
    ]
  },
  {
    route: `${baseRoute}/:movieId/view`,
    items: [
      {
        name: 'view',
        path: `${baseRoute}/:movieId/view`
      },
      {
        name: 'create',
        path: `${baseRoute}/:movieId/create`
      }
    ]
  }
];

export const CONTEXT_MENU_AFM = [
  // TODO #1146
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
    route: `${appsRoute}/organization/:orgId/edit`,
    items: [
      {
        name: 'home',
        path: `${appsRoute}/home`,
        icon: 'home_sidebar'
      },
      {
        name: 'informations',
        path: `${appsRoute}/organization/:orgId/edit`,
      },
      {
        name: 'members',
        path: `${appsRoute}/organization/:orgId/members`,
      },
    ]
  },
  {
    route: `${appsRoute}/organization/:orgId/members`,
    items: [
      {
        name: 'home',
        path: `${appsRoute}/home`,
        icon: 'home_sidebar'
      },
      {
        name: 'informations',
        path: `${appsRoute}/organization/:orgId/edit`,
      },
      {
        name: 'members',
        path: `${appsRoute}/organization/:orgId/members`,
      },
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
