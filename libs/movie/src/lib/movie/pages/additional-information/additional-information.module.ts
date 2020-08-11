import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';

// Blockframes Movie
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/form/promotional-description/promotional-description.module';
import { MovieFormStoryModule } from '@blockframes/movie/form/story/story.module';
import { MovieFormKeywordsModule } from '@blockframes/movie/form/promotional-description/keywords/keywords.module';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';

import { MovieFormAdditionalInformationComponent } from './additional-information.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormCountryModule } from '@blockframes/ui/form';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MovieFormAdditionalInformationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Movie Form Modules
    MovieFormKeywordsModule,
    MovieFormPromotionalDescriptionModule,
    MovieFormStoryModule,

    // Other Modules
    TunnelPageModule,
    ChipsAutocompleteModule,
    StaticSelectModule,
    MatDatepickerModule,
    FlexLayoutModule,
    FormCountryModule,

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
