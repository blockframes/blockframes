import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// Blockframes Movie
import { MovieFormStoryModule } from '@blockframes/movie/form/story/story.module';
import { MovieFormKeywordsModule } from '@blockframes/movie/form/promotional-description/keywords/keywords.module';
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/form/promotional-description/promotional-description.module';
import { MovieFormBudgetModule } from '@blockframes/movie/form/budget/budget.module';

// Blockframes UI
import { FormCountryModule } from '@blockframes/ui/form';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';

import { MovieFormAdditionalInformationComponent } from './additional-information.component';

@NgModule({
  declarations: [MovieFormAdditionalInformationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Movie Form Modules
    MovieFormKeywordsModule,
    MovieFormPromotionalDescriptionModule,
    MovieFormStoryModule,
    MovieFormBudgetModule,

    // Other Modules
    TunnelPageModule,
    ChipsAutocompleteModule,
    StaticSelectModule,
    MatDatepickerModule,
    FlexLayoutModule,
    FormCountryModule,
    FormTableModule,
    HasStatusModule,

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
