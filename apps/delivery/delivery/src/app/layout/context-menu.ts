import { App } from '@blockframes/utils';
import { appsRoute } from '@blockframes/utils/routes';

const baseRoute = `${appsRoute}/${App.mediaDelivering}`;

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
    route: `${baseRoute}/home/list`,
    items: [
      { name: 'home', path: `${baseRoute}/home/list` },
      { name: 'templates', path: `${baseRoute}/templates/list` },
      { name: 'add a delivery', path: `${baseRoute}/delivery/add/1-find-movie` }
    ]
  },
  {
    route: `${baseRoute}/home/create`,
    items: [
      { name: 'home', path: `${baseRoute}/home/list` },
      { name: 'templates', path: `${baseRoute}/templates/list` }
    ]
  },
  {
    route: `${baseRoute}/home/:movieId/edit`,
    items: [
      { name: 'edit film', path: `${baseRoute}/home/:movieId/edit` },
      { name: 'teamwork', path: `${baseRoute}/home/:movieId/teamwork` }
    ]
  },
  {
    route: `${baseRoute}/home/:movieId/teamwork`,
    items: [
      { name: 'edit film', path: `${baseRoute}/home/:movieId/edit` },
      { name: 'teamwork', path: `${baseRoute}/home/:movieId/teamwork` }
    ]
  },
  {
    route: `${baseRoute}/templates/list`,
    items: [
      { name: 'home', path: `${baseRoute}/home/list` },
      { name: 'templates', path: `${baseRoute}/templates/list` }
    ]
  },
  {
    route: `${baseRoute}/templates/create`,
    items: [
      { name: 'home', path: `${baseRoute}/home/list` },
      { name: 'templates', path: `${baseRoute}/templates/create` }
    ]
  },
  {
    route: `${baseRoute}/templates/:templateId`,
    items: [
      { name: 'templates', path: `${baseRoute}/templates/list` },
      { name: 'edit', path: `${baseRoute}/templates/:templateId` }
    ]
  },
  {
    route: `${baseRoute}/delivery/:movieId/list`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/delivery/:movieId/list` },
      { name: 'existing materials', path: `${baseRoute}/delivery/:movieId/materials` }
    ]
  },
  {
    route: `${baseRoute}/delivery/:movieId/materials`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/delivery/:movieId/list` },
      { name: 'existing materials', path: `${baseRoute}/delivery/:movieId/materials` }
    ]
  },
  {
    route: `${baseRoute}/delivery/:movieId/:deliveryId/list`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/delivery/:movieId/list` },
      { name: 'information', path: `${baseRoute}/delivery/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${baseRoute}/delivery/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${baseRoute}/delivery/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${baseRoute}/delivery/:movieId/:deliveryId/informations`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/delivery/:movieId/list` },
      { name: 'information', path: `${baseRoute}/delivery/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${baseRoute}/delivery/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${baseRoute}/delivery/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${baseRoute}/delivery/:movieId/:deliveryId/stakeholders`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/delivery/:movieId/list` },
      { name: 'information', path: `${baseRoute}/delivery/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${baseRoute}/delivery/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${baseRoute}/delivery/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${baseRoute}/account`,
    items: [
      { name: 'profile', path: `${baseRoute}/account/profile` },
      { name: 'wallet', path: `${baseRoute}/account/wallet` }
    ]
  },
  {
    route: `${baseRoute}/organization/:orgId/activityreports`,
    items: [
      { name: 'information', path: `${baseRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${baseRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${baseRoute}/organization/:orgId/activityreports` }
    ]
  },
  {
    route: `${baseRoute}/organization/:orgId/members`,
    items: [
      { name: 'information', path: `${baseRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${baseRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${baseRoute}/organization/:orgId/activityreports` }
    ]
  },
  {
    route: `${baseRoute}/organization/:orgId/edit`,
    items: [
      { name: 'information', path: `${baseRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${baseRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${baseRoute}/organization/:orgId/activityreports` }
    ]
  },
  {
    route: `${baseRoute}/organization/:orgId/administration`,
    items: [
      { name: 'information', path: `${baseRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${baseRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${baseRoute}/organization/:orgId/activityreports` }
    ]
  }
];
