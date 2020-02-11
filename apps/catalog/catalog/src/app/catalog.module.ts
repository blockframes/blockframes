import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieCollectionGuard } from '@blockframes/movie/movie/guards/movie-collection.guard';
import { createRoutes } from '@blockframes/utils/routes';
import { CatalogAppGuard } from './guards/catalog-app.guard';

const routes: Routes = createRoutes({
  appName: 'catalog',
  landing: {
    path: '',
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  },
  appsRoutes: [{
    path: '',
    redirectTo: 'marketplace',
    pathMatch: 'full'
  },
  {
    path: 'marketplace',
    canActivate: [CatalogAppGuard, MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
  },
  {
    path: 'dashboard',
    canActivate: [CatalogAppGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  }]
});

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CatalogModule {}
