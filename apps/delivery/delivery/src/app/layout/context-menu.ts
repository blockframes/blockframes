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
    route: '/layout/:movieId/:deliveryId',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId'},
    ]
  },
  {
    route: '/layout/:movieId/:deliveryId/edit',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId'},
    ]
  },
  {
    route: '/layout/:movieId/:deliveryId/settings',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId'},
    ]
  },
  {
    route: '/layout/:movieId/:deliveryId/teamwork',
    items: [
      { name: 'delivery schedules', path: '/layout/:movieId/list'},
      { name: 'settings', path: '/layout/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/:movieId/:deliveryId'},
    ]
  }
];
