export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      { name: 'explorer', path: '/explorer' }
    ]
  },
  {
    route: '/c/home/form/:movieId',
    items: [
      { name: 'explorer', path: '/explorer' },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/c/:movieId/dashboard' }
    ]
  },
  {
    route: '/c/home/form/:movieId',
    items: [
      { name: 'edit film', path: '/c/home/form/:movieId', exact:true },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/c/:movieId/dashboard'}
    ]
  },
  {
    route: '/c/:movieId/dashboard',
    items: [
      { name: 'edit film', path: '/c/home/form/:movieId' },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/c/:movieId/dashboard', exact:true },
      { name: 'management', path: '/c/:movieId/management' }
    ]
  },
  {
    route: '/c/:movieId/management',
    items: [
      { name: 'edit film', path: '/c/home/form/:movieId' },
      { name: 'see in explorer', path: '/explorer/movie/:movieId' },
      { name: 'dashboard', path: '/c/:movieId/dashboard' },
      { name: 'management', path: '/c/:movieId/management', exact:true }
    ]
  }
];
