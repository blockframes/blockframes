// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MarketplaceMovieViewComponent } from './view.component';
import { MovieShellModule } from '@blockframes/movie/marketplace/shell/shell.module';
import { RouterModule } from '@angular/router';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { UpcomingScreeningsModule } from '@blockframes/movie/components/upcoming-screenings/upcoming-screenings.module';
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';
import { EventViewModule as EventViewLayoutModule } from '@blockframes/event/layout/view/view.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Pipes
import { DisplayNameModule, DisplayPositionModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes';

const routes = [
  {
    path: '',
    component: MarketplaceMovieViewComponent,
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: () => import('@blockframes/movie/marketplace/main/main.module').then(m => m.MovieMainModule),
        data: { animation: 0 }
      },
      {
        path: 'artistic',
        loadChildren: () => import('@blockframes/movie/marketplace/artistic/artistic.module').then(m => m.MovieArtisticModule),
        data: { animation: 1 }
      },
      {
        path: 'production',
        loadChildren: () => import('@blockframes/movie/marketplace/production/production.module').then(m => m.MovieProductionModule),
        data: { animation: 2 }
      },
      {
        path: 'additional',
        loadChildren: () => import('@blockframes/movie/marketplace/additional/additional.module').then(m => m.MovieAdditionalModule),
        data: { animation: 3 }
      },
      {
        path: 'screenings',
        loadChildren: () => import('../screening/screening.module').then(m => m.ScreeningModule),
        data: { animation: 4 }
      }
    ]
  }
];

@NgModule({
  declarations: [MarketplaceMovieViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieShellModule,
    MovieHeaderModule,
    OrgChipModule,
    WishlistButtonModule,
    PromotionalLinksModule,
    UpcomingScreeningsModule,
    OngoingButtonModule,
    EventViewLayoutModule,
    DisplayNameModule,
    DisplayPositionModule,
    OrgNameModule,
    // Material
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}
