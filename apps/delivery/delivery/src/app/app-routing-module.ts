// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LayoutComponent } from './layout/layout.component';

// Guards
import { AuthGuard } from '@blockframes/auth';
import { MovieActiveGuard } from '@blockframes/movie';
import { OrgFormComponent, RightsGuard, OrganizationGuard } from '@blockframes/organization';
import { WelcomeComponent } from 'libs/ui/src/lib/landing-page/welcome.component';
import { MovieEmptyComponent } from '@blockframes/movie/movie/components/movie-empty/movie-empty.component';

export const routes: Routes = [
  { path: '', redirectTo: 'layout', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('@blockframes/auth').then(m => m.AuthModule)
  },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canDeactivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'o',
        pathMatch: 'full'
      },
      {
        path: 'o',
        canActivate: [RightsGuard, OrganizationGuard],
        canDeactivate: [RightsGuard, OrganizationGuard],
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
            path: 'templates',
            loadChildren: () => import('@blockframes/material').then(m => m.TemplateModule)
          },
          {
            path: ':movieId',
            canActivate: [MovieActiveGuard],
            canDeactivate: [MovieActiveGuard],
            loadChildren: () => import('@blockframes/material').then(m => m.DeliveryModule)
          }
        ]
      },
      {
        path: 'welcome',
        children: [
          {
            path: '',
            component: WelcomeComponent
          },
          {
            path: 'create',
            component: OrgFormComponent
          }
          // {
          //   path: 'join-organization',
          //   component: OrgJoinComponent
          // }
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
    redirectTo: 'not-found'
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
