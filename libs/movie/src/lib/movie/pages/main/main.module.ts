import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Blockframes Movie
import { MovieFormGenresModule } from '@blockframes/movie/form/main/genres/genres.module';

// Blockframes Media
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { ReferencePathModule } from '@blockframes/media/directives/media/reference-path.pipe';

// Blockframes UI
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { FormDisplayNameModule } from '@blockframes/ui/form';
import { TunnelPageModule } from '@blockframes/ui/tunnel';

import { MovieFormMainComponent } from './main.component';

@NgModule({
  declarations: [MovieFormMainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Movie Form Modules
    MovieFormGenresModule,

    // Other Modules
    TunnelPageModule,
    ChipsAutocompleteModule,
    ReferencePathModule,
    CropperModule,
    StaticSelectModule,
    FormDisplayNameModule,

    // Material
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormMainComponent }])
  ]
})
export class MovieFormMainModule { }
