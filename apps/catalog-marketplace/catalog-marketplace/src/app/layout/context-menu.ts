export const CONTEXT_MENU = [
  {
    route: '/layout/o/catalog',
    items: [
      { name: 'home', path: '/layout/o/catalog/home' },
      { name: 'search', path: '/layout/o/catalog/search' }
    ]
  },
  {
    route: '/layout/o/catalog/:movieId',
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
