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

export const routes: Routes = [
  { path: '', redirectTo: 'layout', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: '@blockframes/account#AuthModule'  },
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
        canActivate: [RightsGuard /*, OrganizationGuard*/],
        canDeactivate: [RightsGuard/*, OrganizationGuard*/],
        children: [
          {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full'
          },
          {
            path: 'organization',
            loadChildren: '@blockframes/organization#OrganizationModule'
          },
          {
            path: 'account',
            loadChildren: '@blockframes/account#AccountModule'
          },
          {
            path: 'home',
            loadChildren: '@blockframes/movie#MovieModule'
          },
          { path: 'templates',
            loadChildren: '@blockframes/template#TemplateModule'
            // TODO: remove this in favor of dynamic imports when Angular 8 is live
          },
          {
            path: ':movieId',
            canActivate: [MovieActiveGuard],
            canDeactivate: [MovieActiveGuard],
            loadChildren: '@blockframes/material#DeliveryModule'
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
            path: 'create-organization',
            component: OrgFormComponent
          },
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
    loadChildren: '@blockframes/ui#ErrorNotFoundModule'
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
