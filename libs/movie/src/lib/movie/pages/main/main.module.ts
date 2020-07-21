import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MovieFormMainComponent } from './main.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

// Materials
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { ReferencePathModule } from '@blockframes/media/directives/media/reference-path.pipe';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [MovieFormMainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Movie Form Modules
    MovieFormStakeholdersModule,
    MovieFormContentTypeModule,
    MovieFormDirectorsModule,
    MovieFormLanguagesModule,
    MovieFormGenresModule,
    MovieFormTotalRuntimeModule,
    MovieFormFestivalPrizesModule,
    MovieFormOriginalReleasesModule,
    MovieFormSalesCastModule,

    // Other Modules
    TunnelPageModule,
    ChipsAutocompleteModule,
    ReferencePathModule,
    CropperModule,
    StaticSelectModule,

    // Material
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormMainComponent }])
  ]
})
export class MovieFormMainModule { }
