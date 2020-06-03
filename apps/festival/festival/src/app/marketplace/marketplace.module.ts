import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MarketplaceComponent } from './marketplace.component';
import { EventActiveGuard } from '@blockframes/event/guard/event-active.guard';
import { SessionGuard } from '@blockframes/event/guard/session.guard';
import { MarketplaceLayoutModule } from '@blockframes/ui/layout/marketplace/marketplace.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';


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
        data: { animation: 'title-view', redirect: '/c/o/marketplace/home' }
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
        loadChildren: () => import('./event/list/list.module').then(m => m.ListModule),
        data: { animation: 'event-list' }
      }, {
        path: 'calendar',
        loadChildren: () => import('./event/calendar/calendar.module').then(m => m.EventCalendarModule),
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
            canActivate: [SessionGuard],
            loadChildren: () => import('./event/session/session.module').then(m => m.SessionModule),
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
    ImageReferenceModule,

    // Material
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
  ]
})
export class MarketplaceModule {}
