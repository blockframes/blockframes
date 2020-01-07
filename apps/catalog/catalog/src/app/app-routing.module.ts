import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('@blockframes/auth').then(m => m.AuthModule)
  },
  {
    path: 'c',
    children: [{
      path: 'organization',
      loadChildren: () => import('@blockframes/organization').then(m => m.NoOrganizationModule)
    }, {
      path: 'o',
      children: [{
        path: 'marketplace',
        loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      }]
    }]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
