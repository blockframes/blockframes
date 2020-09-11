import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

// Blockframes UI
import { TranslateSlugModule } from '@blockframes/utils/pipes';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';

import { MovieFormProductionComponent } from './production.component';

@NgModule({
  declarations: [MovieFormProductionComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Other Modules
    TunnelPageModule,
    StaticSelectModule,
    ChipsAutocompleteModule,
    FlexLayoutModule,
    FormListModule,
    TranslateSlugModule,

    // Material
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormProductionComponent }]),
  ],
})
export class MovieFormProductionModule { }
