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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { PrizePipeModule } from '../../pipes/display-prize.pipe';
import { MovieFormReviewsComponent } from './reviews.component';

@NgModule({
  declarations: [MovieFormReviewsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Other Modules
    TunnelPageModule,
    StaticSelectModule,
    ChipsAutocompleteModule,
    FlexLayoutModule,
    FormListModule,
    MaxLengthModule,
    ToLabelModule,
    PrizePipeModule,

    // Material
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatTooltipModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormReviewsComponent }]),
  ],
})
export class MovieFormReviewsModule { }
