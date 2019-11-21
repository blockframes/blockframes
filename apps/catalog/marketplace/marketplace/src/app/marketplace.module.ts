import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CatalogBasketGuard } from './guards/catalog-basket-list.guard';
import { MovieCollectionGuard, MovieActiveGuard } from '@blockframes/movie';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'about',
    loadChildren: () => import('./pages/about-page/about.module').then(m => m.AboutModule)
  },
  {
    path: 'who-are-we',
    loadChildren: () => import('./pages/team-page/team.module').then(m => m.TeamModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact-page/contact.module').then(m => m.ContactModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./pages/privacy-page/privacy.module').then(m => m.PrivacyModule)
  },
  {
    path: 'home',
    canActivate: [MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () => import('./movie/home/home.module').then(m => m.MarketplaceHomeModule)
  },
  {
    path: 'search',
    canActivate: [MovieCollectionGuard],
    canDeactivate: [MovieCollectionGuard],
    loadChildren: () => import('./movie/search/search.module').then(m => m.MarketplaceSearchModule)
  },
  {
    path: 'wishlist',
    canActivate: [CatalogBasketGuard, MovieCollectionGuard],
    canDeactivate: [CatalogBasketGuard, MovieCollectionGuard],
    children: [
      {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      },
      {
        path: 'view',
        loadChildren: () => import('./movie/wishlist/wishlist.module').then(m => m.WishlistModule)
      }
    ]
  },
  {
    path: ':movieId',
    canActivate: [MovieActiveGuard],
    canDeactivate: [MovieActiveGuard],
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      {
        path: 'view',
        loadChildren: () => import('./movie/view/view.module').then(m => m.MovieViewModule)
      },
      {
        path: 'create',
        loadChildren: () =>
          import('./distribution-right/create/create.module').then(
            m => m.DistributionRightCreateModule
          )
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class CatalogMarketplaceAppModule {}
