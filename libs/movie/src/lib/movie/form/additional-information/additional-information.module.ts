import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// Blockframes Movie
import { MovieFormStoryModule } from '@blockframes/movie/form/story/story.module';
import { MovieFormBudgetRangeModule } from '@blockframes/movie/form/budget/range/budget-range.module';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

import { MovieFormAdditionalInformationComponent } from './additional-information.component';

@NgModule({
  declarations: [MovieFormAdditionalInformationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Movie Form Modules
    MovieFormStoryModule,
    MovieFormBudgetRangeModule,

    // Other Modules
    TunnelPageModule,
    ChipsAutocompleteModule,
    StaticSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FlexLayoutModule,
    FormListModule,
    HasStatusModule,
    ToLabelModule,

    // Material
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTooltipModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormAdditionalInformationComponent }]),
  ],
})
export class MovieFormAdditionalInformationModule { }
