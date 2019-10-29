import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { App } from '@blockframes/organization';
import { LayoutComponent } from './layout/layout.component';
import { createAppRoutes } from '@blockframes/utils/routes';

const routes = createAppRoutes([{
  path: App.mediaDelivering,
  loadChildren: () => import('./delivery.module').then(m => m.DeliveryAppModule)
}], LayoutComponent)

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
