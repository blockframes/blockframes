import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';
import { MovieActiveGuard } from '@blockframes/movie';
import { MarketplaceComponent } from './marketplace.component';

import { ImgAssetModule } from '@blockframes/ui/theme';

// Widgets
import { SearchWidgetModule } from '@blockframes/ui/search-widget';
import { NotificationWidgetModule } from '@blockframes/notification';
import { ProfileWidgetModule } from '@blockframes/account';

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
      loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
    },
    {
      path: 'notifications',
      loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule)
    },
    {
      path: 'wishlist',
      loadChildren: () => import('./wishlist/wishlist.module').then(m => m.WishlistModule)
    },
    {
      path: 'title',
      children: [{
        path: '',
        loadChildren: () => import('./title/list/list.module').then(m => m.MovieListModule),
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('./title/view/view.module').then(m => m.MovieViewModule)
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

    // Widgets
    NotificationWidgetModule,
    SearchWidgetModule,
    ProfileWidgetModule,
  ]
})
export class MarketplaceModule {}
