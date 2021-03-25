import { Routes, Route } from '@angular/router';
import { UserRedirectionGuard } from '@blockframes/auth/guard/user-redirection.guard';
import { AuthGuard } from '@blockframes/auth/guard/auth.guard';
import { PermissionsGuard } from '@blockframes/permissions/guard/permissions.guard';
import { OrganizationGuard } from '@blockframes/organization/guard/organization.guard';
import { NotificationsGuard } from '@blockframes/notification/notifications.guard';
import { InvitationGuard } from '@blockframes/invitation/guard/invitations.guard';
import { MaintenanceGuard } from '@blockframes/ui/maintenance';
import { RequestAccessGuard } from '@blockframes/organization/guard/request-access.guard';

interface RouteOptions {
  /** The routes of the apps */
  appsRoutes: Routes,
  /** Name of the app to put in data of the route */
  appName: string,
  /** The route to the landing page if any */
  landing?: Route,
}

export function createRoutes({ appsRoutes, appName, landing }: RouteOptions) {
  // Used for internal app
  landing = landing || { path: '', redirectTo: 'auth', pathMatch: 'full' };
  landing.canActivate = landing.canActivate
    ? [...landing.canActivate, UserRedirectionGuard]
    : [UserRedirectionGuard];

  // We need to put the spread operator in a local variable to make build works on prod
  const children = [
    ...appsRoutes,
    {
      path: 'organization',
      loadChildren: () => import('@blockframes/organization/organization.module').then(m => m.OrganizationModule)
    },
    {
      path: 'account',
      loadChildren: () => import('@blockframes/user/account/account.module').then(m => m.AccountModule)
    },
    {
      path: 'request-access',
      canActivate: [RequestAccessGuard],
      loadChildren: () => import('@blockframes/organization/pages/request-access/request-access.module').then(m => m.OrgRequestAccessModule)
    }
  ];
  return [
    {
      path: 'maintenance',
      canActivate: [MaintenanceGuard],
      loadChildren: () => import('@blockframes/ui/maintenance/maintenance.module').then(m => m.MaintenanceModule)
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
              loadChildren: () => import('@blockframes/organization/no-organization.module').then(m => m.NoOrganizationModule)
            },
            {
              path: 'o',
              canActivate: [NotificationsGuard, InvitationGuard, PermissionsGuard, OrganizationGuard],
              canDeactivate: [NotificationsGuard, InvitationGuard, PermissionsGuard, OrganizationGuard],
              children
            }
          ]
        },
        {
          path: 'not-found',
          loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
        },
        {
          path: '**',
          loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
        }
      ]
    }]
}


// Used for CMS & CMR
// Strip out the notifications / invitations
export function createAdminRoutes({ appsRoutes, appName }: RouteOptions) {
  return [
    {
      path: 'maintenance',
      canActivate: [MaintenanceGuard],
      loadChildren: () => import('@blockframes/ui/maintenance/maintenance.module').then(m => m.MaintenanceModule)
    },
    {
      path: '',
      canActivate: [MaintenanceGuard],
      data: { app: appName },
      children: [
        { path: '', redirectTo: 'auth', pathMatch: 'full' },
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
              loadChildren: () => import('@blockframes/organization/no-organization.module').then(m => m.NoOrganizationModule)
            },
            {
              path: 'o',
              canActivate: [PermissionsGuard, OrganizationGuard],
              canDeactivate: [PermissionsGuard, OrganizationGuard],
              children: appsRoutes
            }
          ]
        },
        {
          path: 'not-found',
          loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
        },
        {
          path: '**',
          loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
        }
      ]
    }];
}


export const appsRoute = '/c/o';
