import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatIconModule } from '@angular/material/icon';

// Blockframes UI
import {  ToLabelModule } from '@blockframes/utils/pipes';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { FormDisplayNameModule } from '@blockframes/ui/form/display-name/display-name.module'

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
    FormDisplayNameModule,
    ToLabelModule,

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
