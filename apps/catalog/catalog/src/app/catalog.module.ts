import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieCollectionGuard } from '@blockframes/movie/movieguards/movie-collection.guard';
import { createRoutes } from '@blockframes/utils/routes';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  },
  ...createRoutes({
    appName: 'catalog',
    appsRoutes: [{
      path: '',
      redirectTo: 'marketplace',
      pathMatch: 'full'
    },
    {
      path: 'marketplace',
      canActivate: [MovieCollectionGuard],
      canDeactivate: [MovieCollectionGuard],
      loadChildren: () => import('./marketplace/marketplace.module').then(m => m.MarketplaceModule)
    },
    {
      path: 'dashboard',
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    }]
  })
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CatalogModule {}
