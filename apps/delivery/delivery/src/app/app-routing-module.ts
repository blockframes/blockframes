// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { App } from '@blockframes/organization';

// Components
import { LayoutComponent } from './layout/layout.component';
import { MovieCreateComponent } from '@blockframes/movie/movie/pages/movie-create/movie-create.component';

// Guards
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { NotificationsGuard } from '@blockframes/notification';

export const routes: Routes = [
  { path: '', redirectTo: 'layout', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('@blockframes/auth').then(m => m.AuthModule)
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
            component: MovieCreateComponent
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
            path: 'templates',
            loadChildren: () => import('@blockframes/material').then(m => m.TemplateModule)
          },
          {
            path: 'delivery',
            loadChildren: () => import('@blockframes/material').then(m => m.DeliveryModule)
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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
