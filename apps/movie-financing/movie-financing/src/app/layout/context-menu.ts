export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      { name: 'explorer', path: '/explorer' }
    ]
  },
  {
    route: '/layout/home/form/:movieId',
    items: [
      { name: 'explorer', path: '/explorer' },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/layout/:movieId/dashboard' }
    ]
  },
  {
    route: '/layout/home/form/:movieId',
    items: [
      { name: 'edit film', path: '/layout/home/form/:movieId', exact:true },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/layout/:movieId/dashboard'}
    ]
  },
  {
    route: '/layout/:movieId/dashboard',
    items: [
      { name: 'edit film', path: '/layout/home/form/:movieId' },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/layout/:movieId/dashboard', exact:true },
      { name: 'management', path: '/layout/:movieId/management' }
    ]
  },
  {
    route: '/layout/:movieId/management',
    items: [
      { name: 'edit film', path: '/layout/home/form/:movieId' },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/layout/:movieId/dashboard' },
      { name: 'management', path: '/layout/:movieId/management', exact:true }
    ]
  }
];
