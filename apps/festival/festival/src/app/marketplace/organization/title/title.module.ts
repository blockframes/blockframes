import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

import { TitleComponent } from './title.component';

import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { RequestScreeningModule } from '@blockframes/event/components/request-screening/request-screening.module';
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';
import { LanguageFilterModule } from '@blockframes/movie/form/filters/languages/language-filter.module';
import { ReleaseYearFilterModule } from '@blockframes/movie/form/filters/release-year/release-year.module';
import { StaticCheckBoxesModule } from '@blockframes/ui/static-autocomplete/check-boxes/check-boxes.module';
import { BudgetFilterModule } from '@blockframes/movie/form/filters/budget/budget.module';

@NgModule({
  declarations: [TitleComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    MatRippleModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    
    ListFilterModule,
    ChipsAutocompleteModule,
    LanguageFilterModule,
    ReleaseYearFilterModule,
    StaticCheckBoxesModule,
    BudgetFilterModule,

    RouterModule.forChild([{ path: '', component: TitleComponent }]),
    RequestScreeningModule
  ]
})
export class OrganizationTitleModule { }
