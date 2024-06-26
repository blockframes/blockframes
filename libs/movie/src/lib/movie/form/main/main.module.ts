// Angular
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
import { MatChipsModule } from '@angular/material/chips';

// Blockframes Media
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';

// Blockframes UI
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { FormDisplayNameModule } from '@blockframes/ui/form';
import { CellModalModule } from '@blockframes/ui/cell-modal/cell-modal.module';

// Component
import { MovieFormMainComponent } from './main.component';

// Pipe
import { HasStatusModule } from '../../pipes/has-status.pipe';
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { FilmographyPipeModule } from '../../pipes/filmography.pipe';

@NgModule({
  declarations: [MovieFormMainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CellModalModule,

    // Movie Form ModulesSTATUS
    // Other Modules
    TunnelPageModule,
    ChipsAutocompleteModule,
    ImageUploaderModule,
    StaticSelectModule,
    FormTableModule,
    HasStatusModule,
    FilmographyPipeModule,
    FormDisplayNameModule,
    MaxLengthModule,
    ToLabelModule,

    // Material
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormMainComponent }])
  ]
})
export class MovieFormMainModule { }
