export const CONTEXT_MENU = [
  {
    route: 'default',
    items: []
  },
  {
    route: '/layout/o/catalog/home',
    items: [
      {
        name: 'home',
        path: '/layout/o/catalog/home'
      },
      {
        name: 'catalogue',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'selection',
        path: '/layout/o/catalog/selection/overview'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist'
      }
    ]
  },
  {
    route: '/layout/o/catalog/search',
    items: [
      {
        name: 'home',
        path: '/layout/o/catalog/home'
      },
      {
        name: 'catalogue',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'selection',
        path: '/layout/o/catalog/selection/overview'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist'
      }
    ]
  },
  {
    route: '/layout/o/catalog/selection/overview',
    items: [
      {
        name: 'home',
        path: '/layout/o/catalog/home'
      },
      {
        name: 'catalogue',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'selection',
        path: '/layout/o/catalog/selection/overview'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist'
      }
    ]
  },
  {
    route: '/layout/o/catalog/wishlist',
    items: [
      {
        name: 'home',
        path: '/layout/o/catalog/home'
      },
      {
        name: 'catalogue',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'selection',
        path: '/layout/o/catalog/selection/overview'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist'
      }
    ]
  },
  {
    route: '/layout/o/catalog/:movieId/create',
    items: [
      {
        name: 'view',
        path: '/layout/o/catalog/:movieId/view'
      },
      {
        name: 'create',
        path: '/layout/o/catalog/:movieId/create'
      }
    ]
  },
  {
    route: '/layout/o/catalog/:movieId/view',
    items: [
      {
        name: 'view',
        path: '/layout/o/catalog/:movieId/view'
      },
      {
        name: 'create',
        path: '/layout/o/catalog/:movieId/create'
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
        path: '/layout/o/catalog/home'
      },
      {
        name: 'catalogue',
        path: '/layout/o/catalog/search'
      },
      {
        name: 'wishlist',
        path: '/layout/o/catalog/wishlist'
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

