// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MarketplaceMovieViewComponent } from './view.component';

// Custom Modules
import { MovieDisplayAvailabilitiesModule } from '@blockframes/movie/components/display-availabilities/display-availabilities.module';
import { MovieDisplayPrincipalInformationsModule } from '@blockframes/movie/components/display-principal-informations/display-principal-informations.module';
import { MovieDisplayPrizesModule } from '@blockframes/movie/components/display-prizes/display-prizes.module';
import { MovieDisplayAssetsModule } from '@blockframes/movie/components/display-assets/display-assets.module';
import { MovieDisplayKeywordsModule } from '@blockframes/movie/components/display-keywords/display-keywords.module';
import { MovieDisplayFilmInfoCardModule } from '@blockframes/movie/components/display-film-info-card/display-film-info-card.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
      loadChildren: () => import('../main/main.module').then(m => m.MarketplaceMovieMainModule)
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
    FlexLayoutModule,
    // Custom Modules
    MovieDisplayAvailabilitiesModule,
    MovieDisplayPrincipalInformationsModule,
    MovieDisplayPrizesModule,
    MovieDisplayAssetsModule,
    MovieDisplayKeywordsModule,
    MovieDisplayFilmInfoCardModule,
    ImageReferenceModule,
    // Material
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}
