export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      { name: 'home', path: '/layout/home' },
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
  }
];
