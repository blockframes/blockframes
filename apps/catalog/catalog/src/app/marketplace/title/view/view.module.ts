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
      loadChildren: () => import('@blockframes/movie/marketplace/main/main.module').then(m => m.MovieMainModule)
    },
    {
      path: 'artistic',
      loadChildren: () => import('@blockframes/movie/marketplace/artistic/artistic.module').then(m => m.MovieArtisticModule)
    },
    {
      path: 'production',
      loadChildren: () => import('@blockframes/movie/marketplace/production/production.module').then(m => m.MovieProductionModule)
    },
    {
      path: 'additional',
      loadChildren: () => import('@blockframes/movie/marketplace/additional/additional.module').then(m => m.MovieAdditionalModule)
    },
    {
      path: 'finance',
      loadChildren: () => import('../finance/finance.module').then(m => m.MarketplaceMovieFinanceModule)
    },
    {
      path: 'avails',
      loadChildren: () => import('../avails/avails.module').then(m => m.MarketplaceMovieAvailsModule)
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
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}
