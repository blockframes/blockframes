// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { App } from '@blockframes/organization';

// Components
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';

// Guards
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { NotificationsGuard } from '@blockframes/notification';
import { MovieOrganizationListGuard } from '@blockframes/movie';

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
            path: 'home',
            component: HomeComponent,
            canActivate: [MovieOrganizationListGuard],
            canDeactivate: [MovieOrganizationListGuard]
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
            path: 'templates',
            loadChildren: () => import('@blockframes/template').then(m => m.TemplateModule)
          },
          {
            path: 'delivery',
            loadChildren: () => import('@blockframes/delivery').then(m => m.DeliveryModule)
          },
          {
            path: 'movie',
            loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
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
