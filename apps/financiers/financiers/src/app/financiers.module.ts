import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { createRoutes } from '@blockframes/utils/routes/create-routes';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { NoAuthGuard } from '@blockframes/auth/guard/no-auth.guard';

const routes = createRoutes({
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
      canActivate: [ModuleGuard],
      loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
    },
    {
      path: 'dashboard',
      canActivate: [ModuleGuard],
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    }
  ]
});

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always',
})],
})
export class FinanciersModule { }
