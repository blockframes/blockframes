import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MovieFormMainComponent } from './main.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Materials
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

// Form modules
import { MovieFormStakeholdersModule } from '@blockframes/movie/form/main/stakeholders/stakeholders.module';
import { MovieFormContentTypeModule } from '@blockframes/movie/form/main/content-type/content-type.module';
import { MovieFormDirectorsModule } from '@blockframes/movie/form/main/directors/directors.module';
import { MovieFormLanguagesModule } from '@blockframes/movie/form/main/languages/languages.module';
import { MovieFormGenresModule } from '@blockframes/movie/form/main/genres/genres.module';
import { MovieFormTotalRuntimeModule } from '@blockframes/movie/form/main/total-runtime/total-runtime.module';
import { MovieFormFestivalPrizesModule } from '@blockframes/movie/form/festival-prizes/festival-prizes.module';
import { MovieFormOriginalReleasesModule } from '@blockframes/movie/form/sales-info/original-releases/original-releases.module';
import { MovieFormSalesCastModule } from '@blockframes/movie/form/sales-cast/sales-cast.module';

@NgModule({
  declarations: [MovieFormMainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieFormStakeholdersModule,
    MovieFormContentTypeModule,
    MovieFormDirectorsModule,
    MovieFormLanguagesModule,
    MovieFormGenresModule,
    MovieFormTotalRuntimeModule,
    MovieFormFestivalPrizesModule,
    MovieFormOriginalReleasesModule,
    MovieFormSalesCastModule,
    TunnelPageModule,
    // Material
    MatCardModule,
    MatDividerModule,
    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormMainComponent }])
  ]
})
export class MovieFormMainModule { }
