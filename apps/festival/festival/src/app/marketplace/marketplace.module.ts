import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MarketplaceComponent } from './marketplace.component';

import { MarketplaceLayoutModule } from '@blockframes/ui/layout/marketplace/marketplace.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { EventActiveGuard } from '@blockframes/event/guard/event-active.guard';


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
      loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule),
      data: { animation: 'notifications' }
    },
    {
      path: 'invitations',
      loadChildren: () => import('./invitation/invitation.module').then(m => m.InvitationModule),
      data: { animation: 'invitations' }
    },
    {
      path: 'wishlist',
      loadChildren: () => import('./wishlist/wishlist.module').then(m => m.WishlistModule),
      data: { animation: 'wishlist' }
    },
    {
      path: 'title',
      children: [{
        path: '',
        loadChildren: () => import('./title/list/list.module').then(m => m.MovieListModule),
        data: { animation: 'title-list' }
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule),
        data: { animation: 'title-view' }
      }]
    },
    {
      path: 'organization',
      children: [{
        path: '',
        loadChildren: () => import('./organization/list/list.module').then(m => m.OrganizationListModule),
        data: { animation: 'organization-list' }
      }, {
        path: ':orgId',
        loadChildren: () => import('./organization/view/view.module').then(m => m.OrganizationViewModule),
        data: { animation: 'organization-view' },
      }]
    },
    {
      path: 'event',
      children: [{
        path: '',
        loadChildren: () => import('./event/list/list.module').then(m => m.EventListModule),
        data: { animation: 'event-list' }
      }, {
        path: ':eventId',
        canActivate: [EventActiveGuard],
        canDeactivate: [EventActiveGuard],
        data: { animation: 'event-view' },
        children: [{
            path: '',
            loadChildren: () => import('./event/view/view.module').then(m => m.EventViewModule),
          }, {
            path: 'session',
            loadChildren: () => import('@blockframes/event/layout/session/session.module').then(m => m.EventSessionModule),
          },
        ]
      }]
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

    // Material
    MatListModule,
    MatIconModule,
  ]
})
export class MarketplaceModule {}
