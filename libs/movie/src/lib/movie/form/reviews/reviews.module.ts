import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { PrizePipeModule } from '../../pipes/display-prize.pipe';
import { MovieFormReviewscComponent } from './reviews.component';

@NgModule({
  declarations: [MovieFormReviewscComponent],
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
    RouterModule.forChild([{ path: '', component: MovieFormReviewscComponent }]),
  ],
})
export class MovieFormReviewsModule { }
