// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes, NoPreloading } from '@angular/router';
// Components
import { LayoutComponent } from './layout/layout.component';
import { AppGridComponent } from './app-grid/app-grid.component';
// Routes utils
import { App } from '@blockframes/utils';
import { createRoutes } from '@blockframes/utils/routes';

export const mainAppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'apps',
    pathMatch: 'full'
  },
  {
    path: 'apps',
    component: AppGridComponent
  },
  // {
  //   path: App.mediaDelivering,
  //   data: { app: App.mediaDelivering },
  //   loadChildren: () => import('@blockframes/apps/delivery').then(m => m.DeliveryAppModule)
  // },
  {
    path: App.biggerBoat,
    data: { app: App.biggerBoat },
    loadChildren: () =>
      import('@blockframes/apps/catalog-marketplace').then(m => m.CatalogMarketplaceAppModule)
  },
  // {
  //   path: App.catalogDashboard,
  //   data: { app: App.biggerBoat },
  //   loadChildren: () =>
  //     import('@blockframes/apps/catalog-dashboard').then(m => m.CatalogDashboardAppModule)
  // }
];

/** Scaffold a dashboard like application routing for this application */
const routes = createRoutes({
  appName: 'main',
  layout: LayoutComponent,
  appsRoutes: mainAppRoutes
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
