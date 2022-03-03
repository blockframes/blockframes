import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { createAdminRoutes } from '@blockframes/utils/routes/create-routes';
import { IdlePreload, IdlePreloadModule } from 'angular-idle-preload';

const routes: Route[] = createAdminRoutes({
  appsRoutes: [{
    path: '',
    loadChildren: () => import('./shell/shell.module').then(m => m.ShellModule)
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
export class CmsModule { }
