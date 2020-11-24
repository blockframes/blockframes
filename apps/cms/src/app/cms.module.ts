import { NgModule } from '@angular/core';
import { RouterModule, Route } from '@angular/router';

// TODO: Uncomment before release -> Use for fast production
// import { createRoutes } from '@blockframes/utils/routes/create-routes';
// const routes: Route[] = createRoutes({
//   appName: 'cms',
//   appsRoutes: [{
//     path: '',
//     loadChildren: () => import('./shell/shell.module').then(m => m.ShellModule)
//   }]
// });

const routes: Route[] = [{
  path: '',
  loadChildren: () => import('./shell/shell.module').then(m => m.ShellModule)
}]
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
