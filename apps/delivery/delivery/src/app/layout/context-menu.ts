export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      { name: 'templates', path: '/layout/template/list' },
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
    route: '/layout/template/list',
    items: [
      { name: 'templates', path: '/layout/template/list'},
    ]
  },
  {
    route: '/layout/template/:templateId',
    items: [
      { name: 'templates', path: '/layout/template/list'},
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
    route: '/layout/:movieId/view/:deliveryId',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/form/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/form/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/form/:deliveryId'},
      { name: 'delivery list', path: '/layout/:movieId/view/:deliveryId'},
    ]
  },
  {
    route: '/layout/:movieId/form/:deliveryId',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/form/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/form/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/form/:deliveryId'},
      { name: 'delivery list', path: '/layout/:movieId/view/:deliveryId'},
    ]
  }
];
