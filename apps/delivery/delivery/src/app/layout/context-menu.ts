export const CONTEXT_MENU = [
  {
    route: 'default',
    items: []
  },
  {
    route: '/layout/welcome',
    items: []
  },
  {
    route: '/layout/o/home',
    items: [
      { name: 'home', path: '/layout/o/home' },
      { name: 'templates', path: '/layout/o/templates/list' },
      { name: 'add a delivery', path: '/layout/o/delivery/add/1-find-movie' }
    ]
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
    items: [
      { name: 'home', path: '/layout/o/home' },
      { name: 'templates', path: '/layout/o/templates/list' }
    ]
  },
  {
    route: '/layout/o/templates/create',
    items: [
      { name: 'home', path: '/layout/o/home' },
      { name: 'templates', path: '/layout/o/templates/create' }
    ]
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
      { name: 'existing materials', path: '/layout/o/delivery/:movieId/materials' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/materials',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'existing materials', path: '/layout/o/delivery/:movieId/materials' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/:deliveryId/list',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'information', path: '/layout/o/delivery/:movieId/:deliveryId/informations' },
      { name: 'stakeholders', path: '/layout/o/delivery/:movieId/:deliveryId/stakeholders' },
      { name: 'delivery list', path: '/layout/o/delivery/:movieId/:deliveryId/list' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/:deliveryId/informations',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'information', path: '/layout/o/delivery/:movieId/:deliveryId/informations' },
      { name: 'stakeholders', path: '/layout/o/delivery/:movieId/:deliveryId/stakeholders' },
      { name: 'delivery list', path: '/layout/o/delivery/:movieId/:deliveryId/list' }
    ]
  },
  {
    route: '/layout/o/delivery/:movieId/:deliveryId/stakeholders',
    items: [
      { name: 'deliveries', path: '/layout/o/delivery/:movieId/list' },
      { name: 'information', path: '/layout/o/delivery/:movieId/:deliveryId/informations' },
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
      { name: 'information', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  },
  {
    route: '/layout/o/organization/:orgId/members',
    items: [
      { name: 'information', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  },
  {
    route: '/layout/o/organization/:orgId/edit',
    items: [
      { name: 'information', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  },
  {
    route: '/layout/o/organization/:orgId/administration',
    items: [
      { name: 'information', path: '/layout/o/organization/:orgId/edit' },
      { name: 'members', path: '/layout/o/organization/:orgId/members' },
      { name: 'admin', path: '/layout/o/organization/:orgId/administration' },
      { name: 'activity reports', path: '/layout/o/organization/:orgId/activityreports' }
    ]
  }
];
