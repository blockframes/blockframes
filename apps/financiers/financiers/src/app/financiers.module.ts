import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { createRoutes } from '@blockframes/utils/routes/create-routes';
import { AppGuard } from '@blockframes/utils/routes/app.guard';
import { NoAuthGuard } from '@blockframes/auth/guard/no-auth.guard';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';

const routes: Routes = createRoutes({
  appName: 'financiers',
  landing: {
    path: '',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./landing/landing.module').then(m => m.FinanciersLandingModule)
  },
  appsRoutes: [
    {
      path: '',
      redirectTo: 'marketplace',
      pathMatch: 'full'
    },
    {
      path: 'marketplace',
      canActivate: [AppGuard],
      loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
    },
    {
      path: 'dashboard',
      canActivate: [AppGuard],
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    }
  ]
});

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [
    IdlePreloadModule.forRoot(),
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      relativeLinkResolution: 'corrected',
      preloadingStrategy: IdlePreload
    })],
})
export class FinanciersModule { }
