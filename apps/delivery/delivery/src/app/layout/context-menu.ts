export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      { name: 'templates', path: '/layout/o/templates/list' },
      { name: 'add a delivery', path: '/layout/o/delivery/add/1-find-movie' }
    ]
  },
  {
    route: '/layout/welcome',
    items: []
  },
  {
    route: '/layout/o/home/:movieId/edit',
    items: [
      { name: 'edit film', path: '/layout/o/home/:movieId/edit' },
      { name: 'teamwork', path: '/layout/o/home/:movieId/teamwork' }
    ]
  },
  {
    route: '/layout/o/home/:movieId/teamwork',
    items: [
      { name: 'edit film', path: '/layout/o/home/:movieId/edit' },
      { name: 'teamwork', path: '/layout/o/home/:movieId/teamwork' }
    ]
  },
  {
    route: '/layout/o/templates/list',
    items: [{ name: 'templates', path: '/layout/o/templates/list' }]
  },
  {
    route: '/layout/o/templates/:templateId',
    items: [
      { name: 'templates', path: '/layout/o/templates/list' },
      { name: 'edit', path: '/layout/o/templates/:templateId' }
    ]
  },
  {
    route: '/layout/o/:movieId',
    items: [
      { name: 'delivery schedules', path: '/layout/o/:movieId/list' },
      { name: 'movie materials', path: '/layout/o/:movieId/movie-materials' }
    ]
  },
  {
    route: '/layout/o/:movieId/movie-materials',
    items: [
      { name: 'delivery schedules', path: '/layout/o/:movieId/list' },
      { name: 'movie materials', path: '/layout/o/:movieId/movie-materials' }
    ]
  },
  {
    route: '/layout/o/:movieId/template-picker',
    items: [
      { name: 'delivery schedules', path: '/layout/o/:movieId/list' },
      { name: 'movie materials', path: '/layout/o/:movieId/movie-materials' },
      { name: 'template picker', path: '/layout/o/:movieId/template-picker' }
    ]
  },
  {
    route: '/layout/o/:movieId/:deliveryId/view',
    items: [
      { name: 'delivery schedules', path: '/layout/o/:movieId/list' },
      { name: 'settings', path: '/layout/o/:movieId/:deliveryId/settings' },
      { name: 'teamwork', path: '/layout/o/:movieId/:deliveryId/teamwork' },
      { name: 'edit', path: '/layout/o/:movieId/:deliveryId/edit' },
      { name: 'delivery list', path: '/layout/o/:movieId/:deliveryId/view' }
    ]
  },
  {
    route: '/layout/o/:movieId/:deliveryId/edit',
    items: [
      { name: 'delivery schedules', path: '/layout/o/:movieId/list' },
      { name: 'settings', path: '/layout/o/:movieId/:deliveryId/settings' },
      { name: 'teamwork', path: '/layout/o/:movieId/:deliveryId/teamwork' },
      { name: 'edit', path: '/layout/o/:movieId/:deliveryId/edit' },
      { name: 'delivery list', path: '/layout/o/:movieId/:deliveryId/view' }
    ]
  },
  {
    route: '/layout/o/:movieId/:deliveryId/settings',
    items: [
      { name: 'delivery schedules', path: '/layout/o/:movieId/list' },
      { name: 'settings', path: '/layout/o/:movieId/:deliveryId/settings' },
      { name: 'teamwork', path: '/layout/o/:movieId/:deliveryId/teamwork' },
      { name: 'edit', path: '/layout/o/:movieId/:deliveryId/edit' },
      { name: 'delivery list', path: '/layout/o/:movieId/:deliveryId/view' }
    ]
  },
  {
    route: '/layout/o/:movieId/:deliveryId/teamwork',
    items: [
      { name: 'delivery schedules', path: '/layout/o/:movieId/list' },
      { name: 'settings', path: '/layout/o/:movieId/:deliveryId/settings' },
      { name: 'teamwork', path: '/layout/o/:movieId/:deliveryId/teamwork' },
      { name: 'edit', path: '/layout/o/:movieId/:deliveryId/edit' },
      { name: 'delivery list', path: '/layout/o/:movieId/:deliveryId/view' }
    ]
  },
  {
    route: '/layout/o/account',
    items: [
      { name: 'profile', path: '/layout/o/account/profile' },
      { name: 'wallet', path: '/layout/o/account/wallet' }
    ]
  },
  {
    route: '/layout/o/organization/:orgId/activityreports',
    items: [
      { name: 'informations', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  },
  {
    route: '/layout/o/organization/:orgId/members',
    items: [
      { name: 'informations', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  },
  {
    route: '/layout/o/organization/:orgId/edit',
    items: [
      { name: 'informations', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  },
  {
    route: '/layout/o/organization/:orgId/administration',
    items: [
      { name: 'informations', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  }
];
