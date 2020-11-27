import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { createAdminRoutes } from '@blockframes/utils/routes/create-routes';

const routes: Route[] = createAdminRoutes({
  appName: 'cms',
  appsRoutes: [{
    path: '',
    loadChildren: () => import('./shell/shell.module').then(m => m.ShellModule)
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
    relativeLinkResolution: 'corrected'
  })],
})
export class CmsModule { }
