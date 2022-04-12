import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';
import { MarketplaceLayoutModule } from '@blockframes/ui/layout/marketplace/marketplace.module';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { OrgAccessModule } from '@blockframes/organization/pipes';
import { SidenavAuthModule } from '@blockframes/auth/components/sidenav-auth/sidenav-auth.module';
import { SidenavWidgetModule } from '@blockframes/auth/components/sidenav-widget/sidenav-widget.module';

// Guards
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
      loadChildren: () => import('./title/selection/selection.module').then(m => m.SelectionModule)
    },
    {
      path: 'wishlist',
      loadChildren: () => import('@blockframes/ui/marketplace/pages/wishlist/wishlist.module').then(m => m.WishlistModule),
      data: { animation: 'wishlist' }
    },
    {
      path: 'title',
      children: [{
        path: '',
        loadChildren: () => import('./title/list/list.module').then(m => m.MovieListModule)
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule),
        data: { redirect: '/c/o/marketplace/home' }
      }]
    },
    {
      path: 'organization',
      children: [{
        path: '',
        loadChildren: () => import('./organization/list/list.module').then(m => m.OrganizationListModule),
        data: { animation: 'list' }
      },
      {
        path: ':orgId',
        loadChildren: () => import('./organization/view/view.module').then(m => m.OrganizationViewModule),
        data: { animation: 'view' },
      }]
    },
    {
      path: 'offer',
      children: [{
        path: '',
        loadChildren: () => import('./offer/list/list.module').then(m => m.ListModule),
        data: { animation: 'list' }
      }, {
        path: ':offerId',
        loadChildren: () => import('./offer/shell/shell.module').then(m => m.ShellModule),
        data: { animation: 'list' }
      }]
    },
    {
      path:'standard-terms',
      loadChildren: () => import('@blockframes/contract/contract/pages/standard-terms/standard-terms.module').then(m => m.StandardTermsModule)
    }
  ]
}];

@NgModule({
  declarations: [MarketplaceComponent],
  imports: [
    CommonModule,
    OrgAccessModule,
    FlexLayoutModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MarketplaceLayoutModule,
    SidenavAuthModule,
    SidenavWidgetModule,
    MatBadgeModule,
    MatTooltipModule,
    RouterModule.forChild(routes)
  ]
})
export class MarketplaceModule { }
