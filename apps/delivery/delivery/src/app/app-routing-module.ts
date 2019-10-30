import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';

import { App } from '@blockframes/organization';
import { LayoutComponent } from './layout/layout.component';
import { dashboard } from '@blockframes/utils/routes';

/** Scaffold a dashboard like application routing for this application */
const routes = dashboard({
  layout: LayoutComponent,
  appsRoutes: [{
    path: App.mediaDelivering,
    loadChildren: () => import('./delivery.module').then(m => m.DeliveryAppModule)
  }]
});


@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      preloadingStrategy: NoPreloading
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
