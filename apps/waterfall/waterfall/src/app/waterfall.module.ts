import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { createRoutes } from '@blockframes/utils/routes/create-routes';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { NoLandingGuard } from '@blockframes/auth/guard/no-landing.guard';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';

const routes = createRoutes({
  landing: {
    path: '',
    canActivate: [NoLandingGuard],
    loadChildren: () => import('./landing/landing.module').then(m => m.WaterfallLandingModule)
  },
  appsRoutes: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'marketplace',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'marketplace/home',
      redirectTo: 'dashboard',
      pathMatch: 'full'
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
    IdlePreloadModule.forRoot(),
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      relativeLinkResolution: 'corrected',
      preloadingStrategy: IdlePreload
    })],
})
export class WaterfallModule { }
