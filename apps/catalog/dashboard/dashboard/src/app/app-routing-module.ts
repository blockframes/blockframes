// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes, NoPreloading } from '@angular/router';

// Components
import { LayoutComponent } from './layout/layout.component';
import { dashboard } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils';
// Guards
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { MovieEmptyComponent } from '@blockframes/movie/movie/components/movie-empty/movie-empty.component';


/** Scaffold a marketplace application routing for this application */
const routes = dashboard({
  layout: LayoutComponent,
  // rootPath: `${appsRoute}/${App.biggerBoat}/home`,
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
