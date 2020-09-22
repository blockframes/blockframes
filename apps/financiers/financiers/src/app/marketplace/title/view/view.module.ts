// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MarketplaceMovieViewComponent } from './view.component';

// Custom Modules
import { MovieShellModule } from '@blockframes/movie/marketplace/shell/shell.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
        path: 'finance',
        loadChildren: () => import('../finance/finance.module').then(m => m.MarketplaceMovieFinanceModule),
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
    ImageReferenceModule,
    MovieHeaderModule,
    OrgChipModule,
    WishlistButtonModule,
    PromotionalLinksModule,
    // Material
    MatButtonModule,
    MatIconModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}
