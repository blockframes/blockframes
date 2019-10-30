import { appsRoute } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';

export const CONTEXT_MENU = [
  {
    route: 'default',
    items: []
  },
  {
    route: `${appsRoute}/${App.biggerBoat}/home`,
    items: [
      {
        name: 'home',
        path: `${appsRoute}/${App.biggerBoat}/home`
      },
      {
        name: 'Line-up',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist/overview'
      }
    ]
  },
  {
    route: `${appsRoute}/${App.biggerBoat}/search`,
    items: [
      {
        name: 'home',
        path: `${appsRoute}/${App.biggerBoat}/home`
      },
      {
        name: 'Line-up',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist/overview'
      }
    ]
  },
  {    // TODO issue#1146
    route: '/layout/o/catalog/wishlist/overview',
    items: [
      {
        name: 'home',
        path: `${appsRoute}/${App.biggerBoat}/home`
      },
      {
        name: 'Line-up',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist/overview'
      }
    ]
  },
  {
    route: `${appsRoute}/${App.biggerBoat}/:movieId/create`,
    items: [
      {
        name: 'view',
        path: `${appsRoute}/${App.biggerBoat}/:movieId/view`
      },
      {
        name: 'create',
        path: `${appsRoute}/${App.biggerBoat}/:movieId/create`
      }
    ]
  },
  {
    route: `${appsRoute}/${App.biggerBoat}/:movieId/view`,
    items: [
      {
        name: 'view',
        path: `${appsRoute}/${App.biggerBoat}/:movieId/view`
      },
      {
        name: 'create',
        path: `${appsRoute}/${App.biggerBoat}/:movieId/create`
      }
    ]
  }
];

export const CONTEXT_MENU_AFM = [ // TODO #1146
  {
    route: 'default',
    items: [
      {
        name: 'home',
        icon: 'home_sidebar',
        path: `${appsRoute}/${App.biggerBoat}/home`
      },
      {
        name: 'Line-up',
        path: '/layout/o/catalog/search',
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

