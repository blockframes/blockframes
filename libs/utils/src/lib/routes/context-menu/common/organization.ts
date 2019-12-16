import { appsRoute } from '@blockframes/utils/routes';
import { ctxMenu } from '../helpers';

export const baseRoute = `${appsRoute}/organization`;

export const baseMenu = [
  {
    route: `${baseRoute}/:orgId/edit`,
    items: [
      { name: 'info', path: `${baseRoute}/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/:orgId/members` },
      { name: 'activity', path: `${baseRoute}/:orgId/activity` },
      { name: 'blockchain', path: `${baseRoute}/:orgId/dao`},
    ]
  },
  {
    route: `${baseRoute}/:orgId/members`,
    items: [
      { name: 'info', path: `${baseRoute}/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/:orgId/members` },
      { name: 'activity', path: `${baseRoute}/:orgId/activity` },
      { name: 'blockchain', path: `${baseRoute}/:orgId/dao`},
    ]
  },
  {
    route: `${baseRoute}/:orgId/activity`,
    items: [
      { name: 'info', path: `${baseRoute}/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/:orgId/members` },
      { name: 'activity', path: `${baseRoute}/:orgId/activity` },
      { name: 'blockchain', path: `${baseRoute}/:orgId/dao`},
    ]
  },
  {
    route: `${baseRoute}/:orgId/dao`,
    items: [
      { name: 'info', path: `${baseRoute}/:orgId/edit` },
      { name: 'members', path: `${baseRoute}/:orgId/members` },
      { name: 'activity', path: `${baseRoute}/:orgId/activity` },
      { name: 'blockchain', path: `${baseRoute}/:orgId/dao`},
    ]
  }
];

export const CONTEXT_MENU = ctxMenu(baseMenu);
