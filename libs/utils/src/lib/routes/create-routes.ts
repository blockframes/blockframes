import { Routes, Route } from '@angular/router';
import { AuthGuard, UserRedirectionGuard } from '@blockframes/auth';
import { PermissionsGuard } from '@blockframes/organization/permissions/guard/permissions.guard';
import { OrganizationGuard } from '@blockframes/organization/guard/organization.guard';
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

export function createRoutes({ appsRoutes, appName, landing }: RouteOptions) {
  // We need to put the spread operator in a local variable to make build works on prod
  const children = [
    ...appsRoutes,
    landing = {
      ...landing,
      canActivate: landing.canActivate
        ? [...landing.canActivate, UserRedirectionGuard]
        : [UserRedirectionGuard]
    },
    {
      path: 'organization',
      loadChildren: () => import('@blockframes/organization').then(m => m.OrganizationModule)
    },
    {
      path: 'account',
      loadChildren: () => import('@blockframes/account').then(m => m.AccountModule)
    },
  ];
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
  }]
}


export const appsRoute = '/c/o';
