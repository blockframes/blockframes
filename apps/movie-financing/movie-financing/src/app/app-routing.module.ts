import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// tslint:disable-next-line
import { AuthGuard } from '@blockframes/auth';
import { LayoutComponent } from './layout/layout.component';
//import { AuthGuard } from '@blockframes/auth';

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
    children: [
      { path: '', redirectTo: 'explorer', pathMatch: 'full' },
      { path: 'explorer', loadChildren: 'libs/movie/src/lib/movie/movie.module#MovieModule' }, // loadChildren should lead to the Movie Module
      { path: 'organization', loadChildren: '@blockframes/organization#OrganizationModule' }, // loadChildren should lead to the Organization Module
      { path: 'account', loadChildren: '@blockframes/account#AccountModule' }, // loadChildren should lead to the Account Module
      { path: ':id', loadChildren: './financing/financing.module#FinancingModule' } // should lead to the specific App
    ]
  }
  // {path: '**', component: ErrorComponent}, //  should lead to the 404 Component
];

@NgModule({
  imports: [
    RouterModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
