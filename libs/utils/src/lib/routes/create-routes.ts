import { Routes } from '@angular/router';
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { NotificationsGuard } from '@blockframes/notification';

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
    { path: 'welcome',
    loadChildren: () => import('apps/catalog/catalog/src/app/landing/landing.module').then(m => m.LandingModule)},
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
}



export function createRoutes({ layout, appsRoutes, appName, rootPath = 'layout' }: RouteOptions) {
  const children = [
    ...appsRoutes,
    {
      path: 'organization',
      loadChildren: () => import('@blockframes/organization').then(m => m.OrganizationModule)
    },
    {
      path: 'account',
      loadChildren: () => import('@blockframes/account').then(m => m.AccountModule)
    },
  ];
  return root(layout, children, rootPath, appName);
}


export const appsRoute = '/layout/o';
