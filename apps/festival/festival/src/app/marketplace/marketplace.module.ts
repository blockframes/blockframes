﻿import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { AsideModule } from './layout/aside/aside.module';
import { MarketplaceComponent } from './marketplace.component';
import { MarketplaceLayoutModule } from '@blockframes/ui/layout/marketplace/marketplace.module';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Routes
import { RouterModule, Routes } from '@angular/router';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';

const routes: Routes = [{
  path: '',
  component: MarketplaceComponent,
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
      path: 'home',
      loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
      data: { animation: 'home' }
    },
    {
      path: 'notifications',
      loadChildren: () => import('@blockframes/notification/notification.module').then(m => m.NotificationModule)
    },
    {
      path: 'invitations',
      loadChildren: () => import('@blockframes/invitation/invitation.module').then(m => m.InvitationModule)
    },
    {
      path: 'wishlist',
      loadChildren: () => import('@blockframes/ui/marketplace/pages/wishlist/wishlist.module').then(m => m.WishlistModule)
    },
    {
      path: 'title',
      children: [{
        path: '',
        loadChildren: () => import('./title/list/list.module').then(m => m.MovieListModule),
        data: { animation: 'list' }
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule),
        data: { animation: 'view', redirect: '/c/o/marketplace/home' }
      }]
    },
    {
      path: 'organization',
      children: [{
        path: '',
        loadChildren: () => import('./organization/list/list.module').then(m => m.OrganizationListModule),
        data: { animation: 'list' }
      }, {
        path: ':orgId',
        loadChildren: () => import('./organization/view/view.module').then(m => m.OrganizationViewModule),
        data: { animation: 'view' },
      }]
    },
    {
      path: 'event',
      children: [{
        path: '',
        loadChildren: () => import('./event/list/list.module').then(m => m.ListModule),
      }, {
        path: 'calendar',
        loadChildren: () => import('./event/calendar/calendar.module').then(m => m.EventCalendarModule),
        data: { animation: 'list' },
      }]
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
    }
  ]
}];

@NgModule({
  declarations: [MarketplaceComponent],
  imports: [
    RouterModule.forChild(routes),
    // Angular
    CommonModule,
    FlexLayoutModule,
    MarketplaceLayoutModule,
    AsideModule,
    OrgAccessModule,
    ImageModule,
    
    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ]
})
export class MarketplaceModule { }
