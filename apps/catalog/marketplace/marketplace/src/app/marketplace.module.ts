import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CatalogCartGuard } from './guards/catalog-cart-list.guard';
import { MovieActiveGuard } from '@blockframes/movie';

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
    loadChildren: () => import('./movie/home/home.module').then(m => m.MarketplaceHomeModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./movie/search/search.module').then(m => m.MarketplaceSearchModule)
  },
  {
    path: 'wishlist',
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
          import('@blockframes/movie/deals/create/create.module').then(
            m => m.DistributionDealCreateModule
          )
      }
    ]
  },
  {
    path: 'selection',
    canActivate: [CatalogCartGuard],
    canDeactivate: [CatalogCartGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadChildren: () => import('./movie/selection/selection.module').then(m => m.SelectionModule)
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class CatalogMarketplaceAppModule {}
