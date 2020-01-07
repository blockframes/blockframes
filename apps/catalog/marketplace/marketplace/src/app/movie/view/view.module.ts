// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MarketplaceMovieViewComponent } from './view.component';

// Custom Modules
import {
  CatalogReservedTerritoriesModule,
  CatalogProductionInformationsModule,
  CatalogPromotionalElementsModule
} from '@blockframes/catalog';
import { MovieDisplayAvailabilitiesModule } from '@blockframes/movie/components/display-availabilities/display-availabilities.module';
import { MovieDisplayProductionModule } from '@blockframes/movie/components/display-production/display-production.module';
import { MovieDisplayPrincipalInformationsModule } from '@blockframes/movie/components/display-principal-informations/display-principal-informations.module';
import { MovieDisplaySynopsisModule } from '@blockframes/movie/components/display-synopsis/display-synopsis.module';
import { MovieDisplayFilmDetailsModule } from '@blockframes/movie/components/display-film-details/display-film-details.module';
import { MovieDisplayPrizesModule } from '@blockframes/movie/components/display-prizes/display-prizes.module';
import { MovieDisplayAssetsModule } from '@blockframes/movie/components/display-assets/display-assets.module';
import { MovieDisplayKeywordsModule } from '@blockframes/movie/components/display-keywords/display-keywords.module';
import { MovieDisplayVersionInfoModule } from '@blockframes/movie/components/display-version-info/display-version-info.module';
import { MovieDisplayFilmInfoCardModule } from '@blockframes/movie/components/display-film-info-card/display-film-info-card.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

@NgModule({
  declarations: [MarketplaceMovieViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Custom Modules
    TranslateSlugModule,
    MovieDisplayAvailabilitiesModule,
    MovieDisplayProductionModule,
    MovieDisplayPrincipalInformationsModule,
    MovieDisplaySynopsisModule,
    MovieDisplayFilmDetailsModule,
    MovieDisplayPrizesModule,
    MovieDisplayAssetsModule,
    MovieDisplayKeywordsModule,
    MovieDisplayVersionInfoModule,
    CatalogReservedTerritoriesModule,
    CatalogProductionInformationsModule,
    CatalogPromotionalElementsModule,
    MovieDisplayFilmInfoCardModule,
    ImageReferenceModule,
    //Material
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieViewComponent }])
  ]
})
export class MovieViewModule {}
