// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { ViewComponent } from './view.component';

// Custom Modules
import { MovieViewLayoutModule } from '@blockframes/movie/layout/view/view.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

const routes = [
  {
    path: '',
    component: ViewComponent,
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
  declarations: [ViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieViewLayoutModule,
    ImageReferenceModule,
    MovieHeaderModule,
    OrgChipModule,
    WishlistButtonModule,
    PromotionalLinksModule,

    // Material
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}
