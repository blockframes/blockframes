import { Routes, Route } from '@angular/router';
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { NotificationsGuard } from '@blockframes/notification';
import { MaintenanceGuard } from '@blockframes/ui/maintenance';

interface RouteOptions {
  /** The routes of the apps */
  appsRoutes: Routes,
  /** Name of the app to put in data of the route */
  appName: string,
  /** The route to the landing page if any */
  landing?: Route,
}

const defaultLanding = {
  path: '',
  redirectTo: 'c',
  pathMatch: 'full'
}

export function createRoutes({ appsRoutes, appName, landing = defaultLanding }: RouteOptions) {
  return [
    {
      path: 'maintenance',
      canActivate: [MaintenanceGuard],
      loadChildren: () => import('@blockframes/ui/maintenance').then(m => m.MaintenanceModule)
    },
    {
    path: '',
    canActivate: [MaintenanceGuard],
    data: { app: appName },
    children: [
      landing,
      {
        path: 'auth',
        loadChildren: () => import('@blockframes/auth/auth.module').then(m => m.AuthModule)
      },
      {
        path: 'c',
        canActivate: [AuthGuard],
        canDeactivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: 'o',
            pathMatch: 'full'
          },
          {
            // The redirection route when user has no organization
            path: 'organization',
            loadChildren: () => import('@blockframes/organization').then(m => m.NoOrganizationModule)
          },
          {
            path: 'o',
            canActivate: [NotificationsGuard, PermissionsGuard, OrganizationGuard],
            canDeactivate: [NotificationsGuard, PermissionsGuard, OrganizationGuard],
            children: [
              ...appsRoutes,
              {
                path: 'organization',
                loadChildren: () => import('@blockframes/organization').then(m => m.OrganizationModule)
              },
              {
                path: 'account',
                loadChildren: () => import('@blockframes/account').then(m => m.AccountModule)
              },
            ]
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
  }]
}


export const appsRoute = '/c/o';
