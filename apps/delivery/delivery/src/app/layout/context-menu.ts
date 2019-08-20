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
    route: '/layout/o/delivery/:movieId/list',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'material list', path: '/layout/o/delivery/:movieId/materials' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/materials',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'material list', path: '/layout/o/delivery/:movieId/materials' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/:deliveryId/list',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'informations', path: '/layout/o/delivery/:movieId/:deliveryId/informations' },
      { name: 'stakeholders', path: '/layout/o/delivery/:movieId/:deliveryId/stakeholders' },
      { name: 'delivery list', path: '/layout/o/delivery/:movieId/:deliveryId/list' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/:deliveryId/informations',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'informations', path: '/layout/o/delivery/:movieId/:deliveryId/informations' },
      { name: 'stakeholders', path: '/layout/o/delivery/:movieId/:deliveryId/stakeholders' },
      { name: 'delivery list', path: '/layout/o/delivery/:movieId/:deliveryId/list' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/:deliveryId/stakeholders',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'informations', path: '/layout/o/delivery/:movieId/:deliveryId/informations' },
      { name: 'stakeholders', path: '/layout/o/delivery/:movieId/:deliveryId/stakeholders' },
      { name: 'delivery list', path: '/layout/o/delivery/:movieId/:deliveryId/list' }
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
