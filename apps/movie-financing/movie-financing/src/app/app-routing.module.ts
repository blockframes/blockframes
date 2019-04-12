import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// tslint:disable-next-line
import { AuthGuard } from '@blockframes/auth';
import { LayoutComponent } from './layout/layout.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'layout',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: '@blockframes/auth#AuthModule'
  },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canDeactivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadChildren: '@blockframes/movie#MovieModule' }, // loadChildren should lead to the Movie Module
      { path: 'organization', loadChildren: '@blockframes/organization#OrganizationModule' }, // loadChildren should lead to the Organization Module
      { path: 'account', loadChildren: '@blockframes/account#AccountModule' }, // loadChildren should lead to the Account Module
      { path: ':id', loadChildren: './financing/financing.module#FinancingModule' } // should lead to the specific App
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
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
