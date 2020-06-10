import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LayoutModule } from './layout/layout.module';

// Guards
import { CatalogCartGuard } from '@blockframes/cart/guards/catalog-cart-list.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { ContractsRightListGuard } from '@blockframes/distribution-rights/guards/contracts-right-list.guard';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';
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
      path: 'notifications',
      loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule),
      data: { animation: 'notifications' }
    },
    {
      path: 'invitations',
      loadChildren: () => import('./invitation/invitation.module').then(m => m.InvitationModule),
      data: { animation: 'invitations' }
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
      path: 'deals',
      children: [{
        path: '',
        canActivate: [OrganizationContractListGuard, ContractsRightListGuard],
        canDeactivate: [OrganizationContractListGuard, ContractsRightListGuard],
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
          loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule),
        }
      ],
      data: { redirect: '/c/o/marketplace/home' }
    },
    {
      path: 'about',
      loadChildren: () => import('@blockframes/ui/static-informations/about/about.module').then(m => m.AboutModule)
    },
    {
      path: 'who-are-we',
      loadChildren: () => import('@blockframes/ui/static-informations/team/team.module').then(m => m.TeamModule)
    },
    {
      path: 'contact',
      loadChildren: () => import('@blockframes/ui/static-informations/contact/contact.module').then(m => m.ContactModule)
    },
    {
      path: 'terms',
      loadChildren: () => import('@blockframes/ui/static-informations/privacy/privacy.module').then(m => m.PrivacyModule)
    },
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
