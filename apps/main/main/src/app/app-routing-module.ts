// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Components
import { LayoutComponent } from './layout/layout.component';
import { AppGridComponent } from './app-grid/app-grid.component';

import { App } from '@blockframes/utils';
import { createAppRoutes } from '@blockframes/utils/routes';

export const mainAppRoutes: Routes = [{
  path: '',
  component: AppGridComponent
}, {
  path: App.mediaDelivering,
  loadChildren: () => import('@blockframes/apps/delivery').then(m => m.DeliveryAppModule)
}, {
  path: App.biggerBoat,
  loadChildren: () => import('@blockframes/apps/catalog-marketplace').then(m => m.CatalogMarketplaceAppModule)
}]

const routes = createAppRoutes(mainAppRoutes, LayoutComponent);

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
