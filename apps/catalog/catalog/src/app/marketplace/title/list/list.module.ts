// Pages
import { ListComponent } from './list.component';
import { MovieCardModule } from "@blockframes/movie/components/card/card.module";

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
import { ListPageModule } from "@blockframes/ui/list/page/list-page.module";
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { ListFilterButtonsModule } from '@blockframes/ui/list/buttons/list-filter-buttons.module';
import { LanguageFilterModule } from '@blockframes/movie/form/filters/languages/language-filter.module';
import { BudgetFilterModule } from '@blockframes/movie/form/filters/budget/budget.module';
import { StaticCheckBoxesModule } from '@blockframes/ui/static-autocomplete/check-boxes/check-boxes.module';
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { FormContentTypeModule } from '@blockframes/ui/form/content-type/content-type.module';
import { MinMaxFilterModule } from '@blockframes/movie/form/filters/min-max/min-max.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ScopeMultiselectModule } from '@blockframes/ui/static-autocomplete/scope/scope-multiselect.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MovieCardModule,
    ListPageModule,
    ListFilterModule,
    ListFilterButtonsModule,
    LanguageFilterModule,
    BudgetFilterModule,
    StaticCheckBoxesModule,
    AvailsFilterModule,
    FormContentTypeModule,
    MinMaxFilterModule,
    StaticSelectModule,
    ScopeMultiselectModule,
    GroupMultiselectModule,

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
