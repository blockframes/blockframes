// Pages
import { ListComponent } from './list.component';

// Material
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { AlgoliaChipsAutocompleteModule } from "@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module";
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { ListPageModule } from "@blockframes/ui/list/page/list-page.module";
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { ListFilterButtonsModule } from '@blockframes/ui/list/buttons/list-filter-buttons.module';
import { LanguageFilterModule } from '@blockframes/movie/form/filters/languages/language-filter.module';
import { BudgetFilterModule } from '@blockframes/movie/form/filters/budget/budget.module';
import { StaticCheckBoxesModule } from '@blockframes/ui/static-autocomplete/check-boxes/check-boxes.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { RequestScreeningModule } from '@blockframes/event/components/request-screening/request-screening.module';
import { MinMaxFilterModule } from '@blockframes/movie/form/filters/min-max/min-max.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ScopeMultiselectModule } from '@blockframes/ui/static-autocomplete/scope/scope-multiselect.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MovieCardModule,
    AlgoliaChipsAutocompleteModule,
    ListPageModule,
    ListFilterModule,
    ListFilterButtonsModule,
    LanguageFilterModule,
    BudgetFilterModule,
    StaticCheckBoxesModule,
    ImageModule,
    RequestScreeningModule,
    MinMaxFilterModule,
    GroupMultiselectModule,
    StaticSelectModule,
    ScopeMultiselectModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class MovieListModule { }
