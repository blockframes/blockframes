// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MovieShellComponent, MovieHeader } from './shell.component';

// Custom Modules
import { AppBarModule } from '@blockframes/ui/app-bar';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { UpcomingScreeningsModule } from '@blockframes/movie/components/upcoming-screenings/upcoming-screenings.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';

const routes = [
  {
    path: '',
    component: MovieShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: () => import('../main/main.module').then(m => m.MovieMainModule)
      },
      {
        path: 'screenings',
        loadChildren: () => import('../screening/screening.module').then(m => m.ScreeningModule)
      }
    ]
  }
];

@NgModule({
  declarations: [MovieShellComponent, MovieHeader],
  exports: [MovieHeader],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    MovieHeaderModule,
    OrgChipModule,
    WishlistButtonModule,
    PromotionalLinksModule,
    AppBarModule,
    UpcomingScreeningsModule,
    CarouselModule,
    MatLayoutModule,

    // Material
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieShellModule {}
