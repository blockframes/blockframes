import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { createRoutes } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils/apps';

/** Scaffold a dashboard like application routing for this application */
const routes = createRoutes({
  appName: App.mediaDelivering,
  layout: LayoutComponent,
  appsRoutes: [
    {
      path: '',
      redirectTo: App.mediaDelivering,
      pathMatch: 'full'
    },
    {
      path: App.mediaDelivering,
      loadChildren: () => import('./delivery.module').then(m => m.DeliveryAppModule)
    }
  ]
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
