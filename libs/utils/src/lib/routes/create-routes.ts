import { Routes } from '@angular/router';
import { App } from '@blockframes/organization';

// Components
import { MovieEmptyComponent } from '@blockframes/movie';

// Guards
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { NotificationsGuard } from '@blockframes/notification';

export function createAppRoutes(routes: Routes, LayoutComponent) {
  return [
    { path: '', redirectTo: 'layout', pathMatch: 'full' },
    {
      path: 'auth',
      loadChildren: () => import('@blockframes/auth/auth.module').then(m => m.AuthModule)
    },
    {
      path: 'layout',
      component: LayoutComponent,
      data: { app: App.mediaDelivering },
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
            {
              path: '',
              redirectTo: 'home',
              pathMatch: 'full'
            },
            {
              path: 'no-movies',
              component: MovieEmptyComponent
            },
            {
              path: 'organization',
              loadChildren: () => import('@blockframes/organization').then(m => m.OrganizationModule)
            },
            {
              path: 'account',
              loadChildren: () => import('@blockframes/account').then(m => m.AccountModule)
            },
            {
              path: 'home',
              loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
            },
            {
              path: 'apps',
              children: routes
            }
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
};
