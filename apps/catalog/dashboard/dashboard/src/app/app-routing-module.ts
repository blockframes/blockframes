// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes, NoPreloading } from '@angular/router';

// Components
import { LayoutComponent } from './layout/layout.component';
import { dashboard } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';

/** Scaffold a marketplace application routing for this application */
const routes: Routes = dashboard({
  appName: App.catalogDashboard,
  layout: LayoutComponent,
  appsRoutes: [{
    path: App.catalogDashboard,
    loadChildren: () => import('./catalog-dashboard.module').then(m => m.CatalogDashboardAppModule)
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
