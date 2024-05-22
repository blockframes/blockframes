import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe'
import { FilmographyPipeModule} from '@blockframes/movie/pipes/filmography.pipe';
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { CellModalModule } from '@blockframes/ui/cell-modal/cell-modal.module';

import { MovieFormArtisticComponent } from './artistic.component';

@NgModule({
  declarations: [MovieFormArtisticComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Other Modules
    TunnelPageModule,
    StaticSelectModule,
    ChipsAutocompleteModule,
    FlexLayoutModule,
    FormTableModule,
    FlexLayoutModule,
    HasStatusModule,
    ToLabelModule,
    FilmographyPipeModule,
    MaxLengthModule,
    CellModalModule,

    // Material
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormArtisticComponent }]),
  ],
})
export class MovieFormArtisticModule { }
