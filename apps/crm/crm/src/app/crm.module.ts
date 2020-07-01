import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { createRoutes } from '@blockframes/utils/routes/create-routes';
import { NoAuthGuard } from '@blockframes/auth/guard/no-auth.guard';

const routes: Routes = createRoutes({
  appName: 'crm',
  landing: {
    path: '',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./landing/landing.module').then(m => m.CrmLandingModule)
  },
  appsRoutes: [{
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadChildren: () => import('@blockframes/admin/admin/admin.module').then(m => m.AdminModule)
  }]
});

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    anchorScrolling: 'enabled',
    onSameUrlNavigation: 'reload',
    paramsInheritanceStrategy: 'always',
    relativeLinkResolution: 'corrected',
    preloadingStrategy: PreloadAllModules
  })],
})
export class CrmModule { }
