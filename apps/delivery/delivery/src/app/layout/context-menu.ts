import { App } from '@blockframes/utils';
import { appsRoute } from '@blockframes/utils/routes';

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
    route: `${appsRoute}/home/list`,
    items: [
      { name: 'home', path: `${appsRoute}/home/list` },
      { name: 'templates', path: `${appsRoute}/templates/list` },
      { name: 'add a delivery', path: `${appsRoute}/delivery/add/1-find-movie` }
    ]
  },
  {
    route: `${appsRoute}/home/:movieId/edit`,
    items: [
      { name: 'edit film', path: `${appsRoute}/home/:movieId/edit` },
      { name: 'teamwork', path: `${appsRoute}/home/:movieId/teamwork` }
    ]
  },
  {
    route: `${appsRoute}/home/:movieId/teamwork`,
    items: [
      { name: 'edit film', path: `${appsRoute}/home/:movieId/edit` },
      { name: 'teamwork', path: `${appsRoute}/home/:movieId/teamwork` }
    ]
  },
  {
    route: `${appsRoute}/templates/list`,
    items: [
      { name: 'home', path: `${appsRoute}/home/list` },
      { name: 'templates', path: `${appsRoute}/templates/list` }
    ]
  },
  {
    route: `${appsRoute}/templates/create`,
    items: [
      { name: 'home', path: `${appsRoute}/home/list` },
      { name: 'templates', path: `${appsRoute}/templates/create` }
    ]
  },
  {
    route: `${appsRoute}/templates/:templateId`,
    items: [
      { name: 'templates', path: `${appsRoute}/templates/list` },
      { name: 'edit', path: `${appsRoute}/templates/:templateId` }
    ]
  },
  {
    route: `${appsRoute}/delivery/:movieId/list`,
    items: [
      { name: 'deliveries', path: `${appsRoute}/delivery/:movieId/list` },
      { name: 'existing materials', path: `${appsRoute}/delivery/:movieId/materials` }
    ]
  },
  {
    route: `${appsRoute}/delivery/:movieId/materials`,
    items: [
      { name: 'deliveries', path: `${appsRoute}/delivery/:movieId/list` },
      { name: 'existing materials', path: `${appsRoute}/delivery/:movieId/materials` }
    ]
  },
  {
    route: `${appsRoute}/delivery/:movieId/:deliveryId/list`,
    items: [
      { name: 'deliveries', path: `${appsRoute}/delivery/:movieId/list` },
      { name: 'information', path: `${appsRoute}/delivery/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${appsRoute}/delivery/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${appsRoute}/delivery/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${appsRoute}/delivery/:movieId/:deliveryId/informations`,
    items: [
      { name: 'deliveries', path: `${appsRoute}/delivery/:movieId/list` },
      { name: 'information', path: `${appsRoute}/delivery/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${appsRoute}/delivery/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${appsRoute}/delivery/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${appsRoute}/delivery/:movieId/:deliveryId/stakeholders`,
    items: [
      { name: 'deliveries', path: `${appsRoute}/delivery/:movieId/list` },
      { name: 'information', path: `${appsRoute}/delivery/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${appsRoute}/delivery/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${appsRoute}/delivery/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${appsRoute}/account`,
    items: [
      { name: 'profile', path: `${appsRoute}/account/profile` },
      { name: 'wallet', path: `${appsRoute}/account/wallet` }
    ]
  },
  {
    route: `${appsRoute}/organization/:orgId/activityreports`,
    items: [
      { name: 'information', path: `${appsRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${appsRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${appsRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${appsRoute}/organization/:orgId/activityreports` }
    ]
  },
  {
    route: `${appsRoute}/organization/:orgId/members`,
    items: [
      { name: 'information', path: `${appsRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${appsRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${appsRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${appsRoute}/organization/:orgId/activityreports` }
    ]
  },
  {
    route: `${appsRoute}/organization/:orgId/edit`,
    items: [
      { name: 'information', path: `${appsRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${appsRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${appsRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${appsRoute}/organization/:orgId/activityreports` }
    ]
  },
  {
    route: `${appsRoute}/organization/:orgId/administration`,
    items: [
      { name: 'information', path: `${appsRoute}/organization/:orgId/edit` },
      { name: 'members', path: `${appsRoute}/organization/:orgId/members` },
      { name: 'admin', path: `${appsRoute}/organization/:orgId/administration` },
      { name: 'activity reports', path: `${appsRoute}/organization/:orgId/activityreports` }
    ]
  }
];
