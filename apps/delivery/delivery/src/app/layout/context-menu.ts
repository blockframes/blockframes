export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [{ name: 'home', path: '/layout/home' }, { name: 'templates', path: '/layout/template' }]
  },
  {
    route: '/layout/:movieId',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'templates', path: '/layout/template/list'},
      { name: 'movie materials', path: '/layout/:movieId/movie-materials'},
      { name: 'deliveries', path: '/layout/:movieId/list'},
    ]
  },
  {
    route: '/layout/:movieId/movie-materials',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'templates', path: '/layout/template/list'},
      { name: 'movie materials', path: '/layout/:movieId/movie-materials'},
      { name: 'deliveries', path: '/layout/:movieId/list'},
    ]
  },
  {
    route: '/layout/:movieId/view/:deliveryId',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'templates', path: '/layout/template/list'},
      { name: 'movie materials', path: '/layout/:movieId/movie-materials'},
      { name: 'deliveries', path: '/layout/:movieId/list'},
      { name: 'delivery', path: '/layout/:movieId/view/:deliveryId'},
    ]
  },
  {
    route: '/layout/:movieId/form/:deliveryId',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'templates', path: '/layout/template/list'},
      { name: 'movie materials', path: '/layout/:movieId/movie-materials'},
      { name: 'deliveries', path: '/layout/:movieId/list'},
      { name: 'delivery', path: '/layout/:movieId/form/:deliveryId', exact:true},
      { name: 'team-work', path: '/layout/:movieId/form/:deliveryId/teamwork'},
      { name: 'settings', path: '/layout/:movieId/form/:deliveryId/settings'},
    ]
  },
  {
    route: '/layout/template/list',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'templates', path: '/layout/template/list'},
    ]
  },
  {
    route: '/layout/template/:templateId',
    items: [
      { name: 'home', path: '/layout/home'},
      { name: 'templates', path: '/layout/template/list'},
      { name: 'edit', path: '/layout/template/:templateId'}
    ]
  },
];
