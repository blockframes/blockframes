import { Routes, Route } from '@angular/router';
import { UserRedirectionGuard } from '@blockframes/auth/guard/user-redirection.guard';
import { AuthGuard } from '@blockframes/auth/guard/auth.guard';
import { EmailVerifiedGuard } from '@blockframes/auth/guard/email-verified.guard';
import { LegalTermsGuard } from '@blockframes/auth/guard/legal-terms.guard';
import { PermissionsGuard } from '@blockframes/permissions/guard/permissions.guard';
import { OrganizationGuard } from '@blockframes/organization/guard/organization.guard';
import { MaintenanceGuard } from '@blockframes/ui/maintenance';
import { RequestAccessGuard } from '@blockframes/organization/guard/request-access.guard';

interface RouteOptions {
  /** The routes of the apps */
  appsRoutes: Routes,
  /** The route to the landing page if any */
  landing?: Route,
  /** Event routes if any */
  events?: Route,
}

export function createRoutes({ appsRoutes, landing, events }: RouteOptions) {
  // Used for internal app
  landing = landing || { path: '', redirectTo: 'auth', pathMatch: 'full' };
  landing.canActivate = landing.canActivate
    ? [...landing.canActivate, UserRedirectionGuard]
    : [UserRedirectionGuard];

  const endRules: Routes = [
    {
      path: 'not-found',
      loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
    },
    {
      path: '**',
      loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
    }
  ];

  if (events) {
    endRules.unshift(events);
  }

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
      loadChildren: () => import('@blockframes/organization/request-access.module').then(m => m.OrgRequestAccessModule)
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
              canActivate: [PermissionsGuard, OrganizationGuard, EmailVerifiedGuard, LegalTermsGuard],
              children
            }
          ]
        },
        ...endRules
      ]
    }]
}

// Used for CMS & CRM
// Strip out the notifications / invitations
export function createAdminRoutes({ appsRoutes }: RouteOptions) {
  return [
    {
      path: 'maintenance',
      canActivate: [MaintenanceGuard],
      loadChildren: () => import('@blockframes/ui/maintenance/maintenance.module').then(m => m.MaintenanceModule)
    },
    {
      path: '',
      canActivate: [MaintenanceGuard],
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
