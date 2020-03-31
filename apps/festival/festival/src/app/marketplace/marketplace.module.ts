import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MarketplaceComponent } from './marketplace.component';

import { ImgAssetModule } from '@blockframes/ui/theme';

// Widgets
import { SearchWidgetModule } from '@blockframes/ui/search-widget';
import { NotificationWidgetModule } from '@blockframes/notification/notification/notification-widget/notification-widget.module';
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { AppNavModule } from '@blockframes/ui/app-nav';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';



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
        data: { animation: 'event-view' },
        children: [{
            path: '',
            loadChildren: () => import('./event/view/view.module').then(m => m.EventViewModule),
          }, {
            path: 'session',
            loadChildren: () => import('./event/session/session.module').then(m => m.SessionModule),
          }
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

    // Material
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatMenuModule,

    // Libraries
    ImgAssetModule,
    AppNavModule,

    // Widgets
    NotificationWidgetModule,
    SearchWidgetModule,
    AuthWidgetModule,
  ]
})
export class MarketplaceModule {}
