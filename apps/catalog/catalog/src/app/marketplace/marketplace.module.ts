import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';
import { MarketplaceLayoutModule } from '@blockframes/ui/layout/marketplace/marketplace.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TunnelGuard } from '@blockframes/ui/tunnel';

// Guards
import { CatalogCartGuard } from '@blockframes/cart/guards/catalog-cart-list.guard';
import { ContractsRightListGuard } from '@blockframes/distribution-rights/guards/contracts-right-list.guard';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';
import { ActiveContractGuard } from '@blockframes/contract/contract/guards/active-contract.guard';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [{
  path: '',
  component: MarketplaceComponent,
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
      path: 'home',
      loadChildren: () => import('./home/home.module').then(m => m.MarketplaceHomeModule)
    },
    {
      path: 'about',
      loadChildren: () => import('@blockframes/ui/static-informations/about/about.module').then(m => m.AboutModule)
    },
    {
      path: 'contact',
      loadChildren: () => import('@blockframes/ui/static-informations/contact/contact.module').then(m => m.ContactModule)
    },
    {
      path: 'terms',
      loadChildren: () => import('@blockframes/ui/static-informations/terms/terms.module').then(m => m.TermsModule)
    },
    {
      path: 'privacy',
      loadChildren: () => import('@blockframes/ui/static-informations/privacy/privacy.module').then(m => m.PrivacyModule)
    },
    {
      path: 'notifications',
      loadChildren: () => import('@blockframes/notification/notification.module').then(m => m.NotificationModule),
      data: { animation: 'notifications' }
    },
    {
      path: 'invitations',
      loadChildren: () => import('@blockframes/invitation/invitation.module').then(m => m.InvitationModule),
      data: { animation: 'invitations' }
    },
    {
      path: 'selection',
      canActivate: [CatalogCartGuard],
      canDeactivate: [CatalogCartGuard],
      loadChildren: () => import('./title/selection/selection.module').then(m => m.SelectionModule)
    },
    {
      path: 'wishlist',
      loadChildren: () => import('@blockframes/ui/marketplace/pages/wishlist/wishlist.module').then(m => m.WishlistModule),
      data: { animation: 'wishlist' }
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
      path: 'title',
      children: [{
        path: '',
        loadChildren: () => import('./title/list/list.module').then(m => m.MovieListModule)
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule),
        data: { redirect: '/c/o/marketplace/home' }
      }]
    },
    {
      path: 'tunnel',
      canActivate: [TunnelGuard],
      children: [{
        path: 'contract/:contractId',
        canActivate: [ActiveContractGuard],
        canDeactivate: [ActiveContractGuard],
        loadChildren: () => import('@blockframes/contract/contract/tunnel').then(m => m.ContractTunnelModule),
        data: {
          redirect: '/c/o/dashboard/selection'
        }
      }]
    }]
}];

@NgModule({
  declarations: [MarketplaceComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MarketplaceLayoutModule,
    MatBadgeModule,
    RouterModule.forChild(routes)
  ]
})
export class MarketplaceModule { }
