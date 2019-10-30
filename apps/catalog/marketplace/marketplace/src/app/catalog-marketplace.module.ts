import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CatalogMovieActiveGuard } from './guards/catalog-movie-active.guard';
import { CatalogBasketGuard } from './guards/catalog-basket-list.guard';
import { MovieCollectionGuard } from '@blockframes/movie';

const catalogMarketplaceAppRoutes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    canActivate: [MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () =>
      import('./movie/home/home.module').then(m => m.MarketplaceHomeModule)
  },
  {
    path: 'search',
    canActivate: [MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () =>
      import('./movie/search/search.module').then(m => m.MarketplaceSearchModule)
  },
  {
    path: 'selection',
    canActivate: [CatalogBasketGuard, MovieCollectionGuard],
    canDeactivate: [CatalogBasketGuard, MovieCollectionGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadChildren: () =>
          import('./movie/selection/selection.module').then(m => m.SelectionModule)
      },
      {
        path: 'success',
        loadChildren: () =>
          import('./components/completion.module').then(m => m.CatalogCompletionModule)
      }
    ]
  },
  {
    path: ':movieId',
    canActivate: [CatalogMovieActiveGuard],
    canDeactivate: [CatalogMovieActiveGuard],
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      {
        path: 'view',
        loadChildren: () =>
          import('./movie/view/view.module').then(m => m.MovieViewModule)
      },
      {
        path: 'create',
        loadChildren: () =>
          import('./distribution-right/create/create.module').then(m => m.DistributionRightCreateModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(catalogMarketplaceAppRoutes)]
})
export class CatalogMarketplaceAppModule {}
