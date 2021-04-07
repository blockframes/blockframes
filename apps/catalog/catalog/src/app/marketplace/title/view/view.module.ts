// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { MarketplaceMovieViewComponent } from './view.component';
import { MovieShellModule } from '@blockframes/movie/marketplace/shell/shell.module';
import { RouterModule } from '@angular/router';
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { PromotionalLinksModule } from '@blockframes/movie/components/promotional-links/promotional-links.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';

const routes = [{
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
    },
    {
      path: 'avails',
      loadChildren: () => import('../avails/avails.module').then(m => m.MarketplaceMovieAvailsModule),
      data: { animation: 5 }
    }
  ]
}];

@NgModule({
  declarations: [MarketplaceMovieViewComponent],
  imports: [
    CommonModule,
    MovieShellModule,
    MovieHeaderModule,
    WishlistButtonModule,
    PromotionalLinksModule,
    OrgChipModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule { }
