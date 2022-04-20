import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { createRoutes } from '@blockframes/utils/routes/create-routes';
import { NoAuthGuard } from '@blockframes/auth/guard/no-auth.guard';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';

const routes: Routes = createRoutes({
  landing: {
    path: '',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./landing/landing.module').then(m => m.CrmLandingModule)
  },
  appsRoutes: [{
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  }]
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
export class CrmModule { }
