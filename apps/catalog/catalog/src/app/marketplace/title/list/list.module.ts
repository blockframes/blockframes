// Pages
import { ListComponent } from './list.component';
import { MovieCardModule } from "@blockframes/movie/components/card/card.module";

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { ChipsAutocompleteModule } from "@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module";
import { AlgoliaAutocompleteModule } from "@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module";
import { AlgoliaChipsAutocompleteModule } from "@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module";
import { ListPageModule } from "@blockframes/ui/list/page/list-page.module";
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { ListFilterButtonsModule } from '@blockframes/ui/list/buttons/list-filter-buttons.module';
import { LanguageFilterModule } from '@blockframes/movie/form/filters/languages/language-filter.module';
import { BudgetFilterModule } from '@blockframes/movie/form/filters/budget/budget.module';
import { StaticCheckBoxesModule } from '@blockframes/ui/static-autocomplete/check-boxes/check-boxes.module';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { FormContentTypeModule } from '@blockframes/ui/form/content-type/content-type.module';
import { MinMaxFilterModule } from '@blockframes/movie/form/filters/min-max/min-max.module';
import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MovieCardModule,
    ChipsAutocompleteModule,
    AlgoliaAutocompleteModule,
    AlgoliaChipsAutocompleteModule,
    ListPageModule,
    ListFilterModule,
    ListFilterButtonsModule,
    LanguageFilterModule,
    BudgetFilterModule,
    StaticCheckBoxesModule,
    AvailsFilterModule,
    FormContentTypeModule,
    MinMaxFilterModule,
    StaticGroupModule,
    StaticSelectModule,

    // Material
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class MovieListModule { }
