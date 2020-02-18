import { appsRoute } from '@blockframes/utils/routes';
import { ctxMenu } from '../helpers';

export const baseRoute = `${appsRoute}/organization/:orgId/dao`;

export const baseMenu = [
  {
    route: `${baseRoute}/administration`,
    items: [
      { name: 'info', path: `${appsRoute}/organization/:orgId/edit` },
      { name: 'administration', path: `${baseRoute}/administration`},
      { name: 'history', path: `${baseRoute}/history`},
    ]
  },
  {
    route: `${baseRoute}/history`,
    items: [
      { name: 'info', path: `${appsRoute}/organization/:orgId/edit` },
      { name: 'administration', path: `${baseRoute}/administration`},
      { name: 'history', path: `${baseRoute}/history`},
    ]
  }
];

export const CONTEXT_MENU = ctxMenu(baseMenu);
