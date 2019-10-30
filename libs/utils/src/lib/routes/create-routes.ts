import { Routes, Route } from '@angular/router';
import { MovieEmptyComponent } from '@blockframes/movie';

// Guards
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { NotificationsGuard } from '@blockframes/notification';

const organizationRoute: Route = {
  path: 'organization',
  loadChildren: () => import('@blockframes/organization').then(m => m.OrganizationModule)
};

const accountRoute: Route = {
  path: 'account',
  loadChildren: () => import('@blockframes/account').then(m => m.AccountModule)
};

const movieRoutes: Routes = [{
  path: 'no-movies',
  component: MovieEmptyComponent
},{
  path: 'home',
  loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
}];

interface RouteOptions {
  /** The Layout Component to render */
  layout: any,
  /** The routes of the apps */
  appsRoutes: Routes,
  /** Name of the app to put in data of the route */
  appName: string,
  /** The page to load by default */
  rootPath?: string;
}

function root(LayoutComponent, children: Routes, rootPath: string, appName: string) {
  return [
    { path: '', redirectTo: rootPath, pathMatch: 'full' },
    {
      path: 'auth',
      loadChildren: () => import('@blockframes/auth/auth.module').then(m => m.AuthModule)
    },
    {
      path: 'layout',
      component: LayoutComponent,
      canActivate: [AuthGuard],
      canDeactivate: [AuthGuard],
      data: { app: appName },
      children: [
        {
          path: '',
          redirectTo: 'o',
          pathMatch: 'full'
        },
        {
          path: 'o',
          canActivate: [NotificationsGuard, PermissionsGuard, OrganizationGuard],
          canDeactivate: [NotificationsGuard, PermissionsGuard, OrganizationGuard],
          children
        }
      ]
    },
    {
      path: 'not-found',
      loadChildren: () => import('@blockframes/ui').then(m => m.ErrorNotFoundModule)
    },
    {
      path: '**',
      loadChildren: () => import('@blockframes/ui').then(m => m.ErrorNotFoundModule)
    }
  ]
}

export function marketplace({ layout, appsRoutes, appName, rootPath = 'layout' }: RouteOptions) {
  const children = [
    {
      path: '',
      redirectTo: appsRoutes[0].path,
      pathMatch: 'full'
    },
    organizationRoute,
    accountRoute,
    ...appsRoutes,
  ];
  return root(layout, children, rootPath, appName);
}

export function dashboard({ layout, appsRoutes, appName, rootPath = 'layout' }: RouteOptions) {
  const children = [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    organizationRoute,
    accountRoute,
    ...movieRoutes,
    ...appsRoutes
  ];
  return root(layout, children, rootPath, appName);
}

export const appsRoute = '/layout/o';
