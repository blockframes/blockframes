import { appsRoute } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';
import { ctxMenu } from './helpers';

const baseRoute = `${appsRoute}/${App.mediaDelivering}`;

export const baseMenu = [
  {
    route: '/layout/welcome',
    items: []
  },
  {
    route: `${baseRoute}/home`,
    items: [
      { name: 'home', path: `${baseRoute}/home` },
      { name: 'templates', path: `${baseRoute}/templates` },
      { name: 'add a delivery', path: `${baseRoute}/movie/add/1-find-movie` }
    ]
  },
  {
    route: `${baseRoute}/home/:movieId/edit`,
    items: [
      { name: 'home', path: `${baseRoute}/home` },
      { name: 'edit film', path: `${baseRoute}/home/:movieId/edit` }
    ]
  },
  {
    route: `${baseRoute}/templates/list`,
    items: [
      { name: 'home', path: `${baseRoute}/home` },
      { name: 'templates', path: `${baseRoute}/templates` }
    ]
  },
  {
    route: `${baseRoute}/templates/create`,
    items: [
      { name: 'home', path: `${baseRoute}/home` },
      { name: 'templates', path: `${baseRoute}/templates` }
    ]
  },
  {
    route: `${baseRoute}/templates/:templateId`,
    items: [
      { name: 'templates', path: `${baseRoute}/templates` },
      { name: 'edit', path: `${baseRoute}/templates/:templateId` }
    ]
  },
  {
    route: `${baseRoute}/movie/:movieId/list`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/movie/:movieId/list` },
      { name: 'existing materials', path: `${baseRoute}/movie/:movieId/materials` }
    ]
  },
  {
    route: `${baseRoute}/movie/:movieId/materials`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/movie/:movieId/list` },
      { name: 'existing materials', path: `${baseRoute}/movie/:movieId/materials` }
    ]
  },
  {
    route: `${baseRoute}/movie/:movieId/:deliveryId/list`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/movie/:movieId/list` },
      { name: 'information', path: `${baseRoute}/movie/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${baseRoute}/movie/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${baseRoute}/movie/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${baseRoute}/movie/:movieId/:deliveryId/informations`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/movie/:movieId/list` },
      { name: 'information', path: `${baseRoute}/movie/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${baseRoute}/movie/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${baseRoute}/movie/:movieId/:deliveryId/list` }
    ]
  },
  {
    route: `${baseRoute}/movie/:movieId/:deliveryId/stakeholders`,
    items: [
      { name: 'deliveries', path: `${baseRoute}/movie/:movieId/list` },
      { name: 'information', path: `${baseRoute}/movie/:movieId/:deliveryId/informations` },
      { name: 'stakeholders', path: `${baseRoute}/movie/:movieId/:deliveryId/stakeholders` },
      { name: 'delivery list', path: `${baseRoute}/movie/:movieId/:deliveryId/list` }
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

export const CONTEXT_MENU = ctxMenu(baseMenu);
