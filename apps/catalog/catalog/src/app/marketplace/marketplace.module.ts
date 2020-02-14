import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CatalogCartGuard } from '@blockframes/organization/cart/guards/catalog-cart-list.guard';
import { MovieActiveGuard } from '@blockframes/movie';
import { LayoutComponent } from './layout/layout.component';
import { LayoutModule } from './layout/layout.module';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { ActiveContractGuard } from '@blockframes/contract/contract/guards/active-contract.guard';

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
      path: 'search',
      loadChildren: () => import('./movie/search/search.module').then(m => m.MarketplaceSearchModule)
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
      path: ':movieId',
      canActivate: [MovieActiveGuard],
      canDeactivate: [MovieActiveGuard],
      children: [
        { path: '', redirectTo: 'view', pathMatch: 'full' },
        {
          path: 'view',
          loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule)
        },
        {
          path: 'create',
          loadChildren: () =>
            import('@blockframes/movie/distribution-deals/create/create.module').then(
              m => m.DistributionDealCreateModule
            )
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
export class MarketplaceModule {}
