export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      { name: 'templates', path: '/layout/with-org-segment/templates/list'},
    ]
  },
  {
    route: '/layout/welcome',
    items: []
  },
  {
    route: '/layout/with-org-segment/with-org-segment/home/:movieId/edit',
    items: [
      { name: 'edit film', path: '/layout/with-org-segment/with-org-segment/home/:movieId/edit' },
      { name: 'teamwork', path: '/layout/with-org-segment/with-org-segment/home/:movieId/teamwork'},
    ]
  },
  {
    route: '/layout/with-org-segment/home/:movieId/teamwork',
    items: [
      { name: 'edit film', path: '/layout/with-org-segment/home/:movieId/edit' },
      { name: 'teamwork', path: '/layout/with-org-segment/home/:movieId/teamwork'},
    ]
  },
  {
    route: '/layout/with-org-segment/templates/list',
    items: [
      { name: 'templates', path: '/layout/with-org-segment/templates/list'},
    ]
  },
  {
    route: '/layout/with-org-segment/templates/:templateId',
    items: [
      { name: 'templates', path: '/layout/with-org-segment/templates/list'},
      { name: 'edit', path: '/layout/with-org-segment/templates/:templateId'}
    ]
  },
  {
    route: '/layout/with-org-segment/:movieId',
    items: [
      { name: 'delivery schedules', path: '/layout/with-org-segment/:movieId/list'},
      { name: 'movie materials', path: '/layout/with-org-segment/:movieId/movie-materials'},
    ]
  },
  {
    route: '/layout/with-org-segment/:movieId/movie-materials',
    items: [
      { name: 'delivery schedules', path: '/layout/with-org-segment/:movieId/list'},
      { name: 'movie materials', path: '/layout/with-org-segment/:movieId/movie-materials'},
    ]
  },
  {
    route: '/layout/with-org-segment/:movieId/template-picker',
    items: [
      { name: 'delivery schedules', path: '/layout/with-org-segment/:movieId/list'},
      { name: 'movie materials', path: '/layout/with-org-segment/:movieId/movie-materials'},
      { name: 'template picker', path: '/layout/with-org-segment/:movieId/template-picker'},
    ]
  },
  {
    route: '/layout/with-org-segment/:movieId/:deliveryId/view',
    items: [
      { name: 'delivery schedules', path: '/layout/with-org-segment/:movieId/list'},
      { name: 'settings', path: '/layout/with-org-segment/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/with-org-segment/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/with-org-segment/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/with-org-segment/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/with-org-segment/:movieId/:deliveryId/edit',
    items: [
      { name: 'delivery schedules', path: '/layout/with-org-segment/:movieId/list'},
      { name: 'settings', path: '/layout/with-org-segment/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/with-org-segment/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/with-org-segment/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/with-org-segment/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/with-org-segment/:movieId/:deliveryId/settings',
    items: [
      { name: 'delivery schedules', path: '/layout/with-org-segment/:movieId/list'},
      { name: 'settings', path: '/layout/with-org-segment/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/with-org-segment/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/with-org-segment/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/with-org-segment/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/with-org-segment/:movieId/:deliveryId/teamwork',
    items: [
      { name: 'delivery schedules', path: '/layout/with-org-segment/:movieId/list'},
      { name: 'settings', path: '/layout/with-org-segment/:movieId/:deliveryId/settings'},
      { name: 'teamwork', path: '/layout/with-org-segment/:movieId/:deliveryId/teamwork'},
      { name: 'edit', path: '/layout/with-org-segment/:movieId/:deliveryId/edit'},
      { name: 'delivery list', path: '/layout/with-org-segment/:movieId/:deliveryId/view'},
    ]
  },
  {
    route: '/layout/with-org-segment/account',
    items: [
      { name: 'profile', path: '/layout/with-org-segment/account/profile' },
      { name: 'wallet', path: '/layout/with-org-segment/account/wallet'},
    ]
  }
];
