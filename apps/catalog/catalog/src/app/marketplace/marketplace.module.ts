import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { LayoutModule } from './layout/layout.module';

// Guards
import { CatalogCartGuard } from '@blockframes/cart/guards/catalog-cart-list.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { ContractsRightListGuard } from '@blockframes/distribution-rights/guards/contracts-right-list.guard';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MovieListContractListGuard } from '@blockframes/movie/guards/movie-contract.guard';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';
import { ActiveContractGuard } from '@blockframes/contract/contract/guards/active-contract.guard';
import { MovieCollectionGuard } from '@blockframes/movie/guards/movie-collection.guard';

const routes: Routes = [{
  path: '',
  component: LayoutComponent,
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
      path: 'home',
      loadChildren: () => import('./movie/home/home.module').then(m => m.MarketplaceHomeModule)
    },
    {
      path: 'about',
      loadChildren: () => import('./landing/about/about.module').then(m => m.AboutModule)
    },
    {
      path: 'who-are-we',
      loadChildren: () => import('./landing/team/team.module').then(m => m.TeamModule)
    },
    {
      path: 'contact',
      loadChildren: () => import('./landing/contact/contact.module').then(m => m.ContactModule)
    },
    {
      path: 'terms',
      loadChildren: () => import('./landing/privacy/privacy.module').then(m => m.PrivacyModule)
    },
    {
      path: 'search',
      /**
       *  If we are coming from different routes inside marketpalce
       * and they set one movie active, we need to reset that to get all of them back
       */
      canActivate: [MovieCollectionGuard],
      canDeactivate: [MovieCollectionGuard],
      loadChildren: () => import('./movie/search/search.module').then(m => m.MarketplaceSearchModule)
    },
    {
      path: 'activity',   // List of notifications
      loadChildren: () => import('../activity/activity.module').then(m => m.ActivityModule)
    },
    {
      path: 'selection',
      canActivate: [CatalogCartGuard],
      canDeactivate: [CatalogCartGuard],
      loadChildren: () => import('./movie/selection/selection.module').then(m => m.SelectionModule)
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
      path: 'deals',
      children: [{
        path: '',
        canActivate: [OrganizationContractListGuard, ContractsRightListGuard, MovieListContractListGuard],
        canDeactivate: [OrganizationContractListGuard, ContractsRightListGuard, MovieListContractListGuard],
        loadChildren: () => import('./right/list/list.module').then(m => m.RightListModule),
      }, {
        path: ':contractId',
        canActivate: [ActiveContractGuard],
        canDeactivate: [ActiveContractGuard],
        loadChildren: () => import('./right/view/view.module').then(m => m.RightViewModule)
      }]
    },
    {
      path: ':movieId',
      canActivate: [MovieActiveGuard],
      canDeactivate: [MovieActiveGuard],
      children: [
        { path: '', redirectTo: 'view', pathMatch: 'full' },
        {
          path: 'view',
          loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule)
        }
      ]
    }
  ]
}, {
  path: 'tunnel',
  canActivate: [TunnelGuard],
  children: [{
    path: 'contract/:contractId',
    canActivate: [ActiveContractGuard],
    canDeactivate: [ActiveContractGuard],
    loadChildren: () => import('@blockframes/contract/contract/tunnel').then(m => m.ContractTunnelModule),
    data: {
      redirect: '/c/o/dashboard/selection'
    },
  }]
}];

@NgModule({
  imports: [LayoutModule, RouterModule.forChild(routes)]
})
export class MarketplaceModule { }
