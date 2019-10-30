import { appsRoute } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';
export const CONTEXT_MENU = [
  {
    route: 'default',
    items: [
      // { name: 'home', path: '${appsRoute}/${App.catalogDashboard}/catalog/home' }, @todo #878 removed for torronto
      {
        name: 'movie list',
        path: `${appsRoute}/home/list`
      }, // temp
      {
        name: 'Upload avails & films doc',
        path: `${appsRoute}/${App.catalogDashboard}/import`
      }, // temp until good place for this route is found
      {
        name: 'New Deals',
        path: 'https://projects.invisionapp.com/share/KWTO3NFHQCZ#/screens/381254658',
        external: true
      },
      {
        name: 'Sales',
        path: 'https://projects.invisionapp.com/share/KWTO3NFHQCZ#/screens/381254662',
        external: true
      }
    ]
  }
];
