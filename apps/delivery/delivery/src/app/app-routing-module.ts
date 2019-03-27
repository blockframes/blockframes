// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LayoutComponent } from './layout/layout.component';

// Guards
import { AuthGuard } from '@blockframes/auth';

export const routes: Routes = [
  { path: '', redirectTo: 'delivery', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: '@blockframes/auth#AuthModule'
  },
  {
    path: 'delivery',
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
      { path: 'template', loadChildren: './template/template.module#TemplateModule' },
      {
        path: ':id', loadChildren: './delivery/delivery.module#DeliveryModule' },
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
