// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LayoutComponent } from './layout/layout.component';

// Guards
import { AuthGuard } from '@blockframes/auth';
import { MovieGuard } from '@blockframes/movie';

export const routes: Routes = [
  { path: '', redirectTo: 'layout', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: '@blockframes/auth#AuthModule'
  },
  {
    path: 'layout',
    component: LayoutComponent,
    //canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'explorer', pathMatch: 'full' },
      {
        path: 'organization',
        loadChildren: '@blockframes/organization#OrganizationModule'
      },
      {
        path: 'account',
        loadChildren: '@blockframes/account#AccountModule'
      },
      { path: 'explorer', loadChildren: '@blockframes/movie#MovieModule' },
      { path: 'template', loadChildren: '@blockframes/delivery#TemplateModule' },
      {
        path: ':id', canActivate: [MovieGuard], loadChildren: '@blockframes/delivery#DeliveryModule' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{
    anchorScrolling: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
