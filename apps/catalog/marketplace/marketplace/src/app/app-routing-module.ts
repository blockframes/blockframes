import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { marketplace } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';

/** Scaffold a marketplace application routing for this application */
const routes = marketplace({
  appName: App.biggerBoat,
  layout: LayoutComponent,
  appsRoutes: [{
    path: App.biggerBoat,
    loadChildren: () => import('./catalog-marketplace.module').then(m => m.CatalogMarketplaceAppModule)
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
