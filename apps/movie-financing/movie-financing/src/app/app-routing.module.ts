import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// tslint:disable-next-line
import { AuthGuard } from '@blockframes/auth';
import { LayoutComponent } from './layout/layout.component';
import { FinancingExplorerHomeComponent } from './explorer/home/home.component';
import { FinancingExplorerSearchComponent } from './explorer/search/search.component';
import { FinancingExplorerDetailsComponent } from './explorer/details/details.component';
import { FinancingExplorerProfileComponent } from './explorer/profile/profile.component';


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
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadChildren: '@blockframes/movie#MovieModule' }, // loadChildren should lead to the Movie Module
      { path: 'organization', loadChildren: '@blockframes/organization#OrganizationModule' }, // loadChildren should lead to the Organization Module
      { path: 'account', loadChildren: '@blockframes/account#AccountModule' }, // loadChildren should lead to the Account Module
      { path: ':id', loadChildren: './financing/financing.module#FinancingModule' } // should lead to the specific App
    ]
  },
  {
    path: 'explorer',
    component: FinancingExplorerHomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explorer/search',
    component: FinancingExplorerSearchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explorer/movie/:id',
    component: FinancingExplorerDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:id',
    component: FinancingExplorerProfileComponent,
    canActivate: [AuthGuard]
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
