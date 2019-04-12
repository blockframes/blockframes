import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Component
import { LayoutComponent } from './layout/layout.component';

// Guard
import { AuthGuard } from '@blockframes/auth';
import { IpGuard } from '@blockframes/ip'

export const routes: Routes = [
  { 
    path:'',
    redirectTo: 'layout',
    pathMatch:'full'
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
      { 
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'ip/:id',
        canActivate: [IpGuard],
        loadChildren: './business/business.module#BusinessModule'
      },
      {
        path: 'home',
        loadChildren: '@blockframes/ip#IpModule'
      },
      {
        path: 'organization',
        loadChildren: '@blockframes/organization#OrganizationModule'
      },
      {
        path: 'account',
        loadChildren: '@blockframes/account#AccountModule'
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
