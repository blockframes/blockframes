// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LayoutComponent } from './layout/layout.component';

// Guards
import { AuthGuard } from '@blockframes/auth';
import { MovieGuard } from '@blockframes/movie';
import { OrganizationListGuard } from '@blockframes/organization';

export const routes: Routes = [
  { path: '', redirectTo: 'layout', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: '@blockframes/auth#AuthModule'
  },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard, OrganizationListGuard],
    canDeactivate: [OrganizationListGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'organization',
        loadChildren: '@blockframes/organization#OrganizationModule'
      },
      {
        path: 'account',
        loadChildren: '@blockframes/account#AccountModule'
      },
      { path: 'home', loadChildren: '@blockframes/movie#MovieModule' },
      { path: 'template', loadChildren: 'libs/material/src/lib/template/template.module#TemplateModule' }, //ToDo find why @blockframes doesn't work
      {
        path: ':movieId',
        canActivate: [MovieGuard],
        loadChildren: '@blockframes/material#DeliveryModule'
      },
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
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
