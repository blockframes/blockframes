import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { MovieFormShootingInformationComponent } from './shooting-information.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { InputAutocompleteModule } from '@blockframes/ui/static-autocomplete/input/input-autocomplete.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

@NgModule({
  declarations: [MovieFormShootingInformationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Blockframes
    TunnelPageModule,
    FormListModule,
    InputAutocompleteModule,
    ToLabelModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatRadioModule,
    MatSelectModule,
    MatChipsModule,
    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormShootingInformationComponent }]),
  ],
})
export class MovieFormShootingInformationModule { }
