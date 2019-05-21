export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      { name: 'templates', path: '/layout/templates/list' },
    ]
  },
  {
    route: '/layout/home/form/:movieId',
    items: [
      { name: 'edit film', path: '/layout/home/form/:movieId', exact:true },
      { name: 'teamwork', path: '/layout/home/form/:movieId/teamwork', exact:true },
    ]
  },
  {
    route: '/layout/templates/list',
    items: [
      { name: 'templates', path: '/layout/templates/list'},
    ]
  },
  {
    route: '/layout/template/:templateId',
    items: [
      { name: 'templates', path: '/layout/templates/list'},
      { name: 'edit', path: '/layout/template/:templateId'}
    ]
  },
  {
    route: '/layout/:movieId',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'movie materials', path: '/layout/:movieId/movie-materials'},
    ]
  },
  {
    route: '/layout/:movieId/movie-materials',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'movie materials', path: '/layout/:movieId/movie-materials'},
    ]
  },
  {
    route: '/layout/:movieId/template-picker',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'movie materials', path: '/layout/:movieId/movie-materials'},
      { name: 'template picker', path: '/layout/:movieId/template-picker'},
    ]
  },
  {
    route: '/layout/:movieId/:deliveryId/view',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/:movieId/:deliveryId/edit',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/:movieId/:deliveryId/settings',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/:movieId/:deliveryId/teamwork',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/account',
    items: [
      { name: 'profile', path: '/layout/account/profile' },
      { name: 'wallet', path: '/layout/account/wallet'},
    ]
  }
];
