import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { createAppRoutes } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';

const routes = createAppRoutes([{
  path: App.biggerBoat,
  loadChildren: () => import('./catalog-marketplace.module').then(m => m.CatalogMarketplaceAppModule)
}], LayoutComponent);

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
