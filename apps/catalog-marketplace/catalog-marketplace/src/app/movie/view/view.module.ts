// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { MovieViewComponent } from './view.component';
import { MovieDisplayAvailabilitiesComponent } from '@blockframes/movie/movie/components/display-availabilities/display-availabilities.component'
import { MovieDisplayProductionComponent } from '@blockframes/movie/movie/components/display-production/display-production.component'
import { MovieDisplayPrincipalInfoComponent } from '@blockframes/movie/movie/components/display-principal-info/display-principal-info.component'
import { MovieDisplaySynopsisComponent } from '@blockframes/movie/movie/components/display-synopsis/display-synopsis.component'
import { MovieDisplayFilmDetailsComponent } from '@blockframes/movie/movie/components/display-film-details/display-film-details.component'
import { MovieDisplayPrizesComponent } from '@blockframes/movie/movie/components/display-prizes/display-prizes.component'
import { MovieDisplayAssetsComponent } from '@blockframes/movie/movie/components/display-assets/display-assets.component'
import { MovieDisplayKeywordsComponent } from '@blockframes/movie/movie/components/display-keywords/display-keywords.component'
import { MovieDisplayVersionInfoComponent } from '@blockframes/movie/movie/components/display-version-info/display-version-info.component'

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [MovieViewComponent,
    MovieDisplayAvailabilitiesComponent,
    MovieDisplayProductionComponent,
    MovieDisplayPrincipalInfoComponent,
    MovieDisplaySynopsisComponent,
    MovieDisplayFilmDetailsComponent,
    MovieDisplayPrizesComponent,
    MovieDisplayAssetsComponent,
    MovieDisplayKeywordsComponent,
    MovieDisplayVersionInfoComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterModule.forChild([
      { path: '', component: MovieViewComponent }
    ])
  ],
})
export class MovieViewModule {}
