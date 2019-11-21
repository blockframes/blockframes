import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { createRoutes } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils/apps';

/** Scaffold a marketplace application routing for this application */
const routes = createRoutes({
  appName: App.biggerBoat,
  layout: LayoutComponent,
  appsRoutes: [
    {
      path: '',
      redirectTo: App.biggerBoat,
      pathMatch: 'full'
    },
    {
      path: App.biggerBoat,
      canActivate: [MovieCollectionGuard],
      canDeactivate: [MovieCollectionGuard],
      loadChildren: () =>
        import('./marketplace.module').then(m => m.CatalogMarketplaceAppModule)
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
