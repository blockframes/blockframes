import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { createRoutes } from '@blockframes/utils/routes/create-routes';

const routes: Routes = createRoutes({
  appName: 'cms',
  appsRoutes: [{
    path: '',
    redirectTo: 'festival',
    pathMatch: 'full'
  },
  {
    path: 'festival',
    loadChildren: () => import('./festival/festival.module').then(m => m.FestivalModule)
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
