// Components
import { MovieCardModule } from "@blockframes/movie/components/card/card.module";
import { MovieDisplayListModule } from '@blockframes/movie/components/display-list/display-list.module';

// Pipes
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.module";
import { TranslateSlugModule } from "@blockframes/utils/pipes/translate-slug.module";


// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ChipsAutocompleteModule } from "@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module";
import { AlgoliaAutocompleteModule } from "@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module";
import { AlgoliaChipsAutocompleteModule } from "@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module";
import { TitleListLayoutModule } from "@blockframes/movie/layout/list/title-list.module"
import { WishlistButtonModule } from "@blockframes/organization/components/wishlist-button/wishlist-button.module";
import { TitleFilterModule } from '@blockframes/movie/components/title-filter/title-filter.module';
import { MovieFormEstimatedBudgetModule } from "@blockframes/movie/form/budget/estimated-budget/estimated-budget.module";
import { LanguageFilterModule } from '@blockframes/movie/form/filters/languages/language-filter.module';
import { BudgetFilterModule } from '@blockframes/movie/form/filters/budget/budget.module';
import { StaticCheckBoxesModule } from '@blockframes/ui/static-autocomplete/check-boxes/check-boxes.module';
import { ListComponent } from "./list.component";

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    HttpClientModule,
    MovieCardModule,
    MovieDisplayListModule,
    ChipsAutocompleteModule,
    AlgoliaAutocompleteModule,
    AlgoliaChipsAutocompleteModule,
    TitleListLayoutModule,
    WishlistButtonModule,
    TitleFilterModule,
    MovieFormEstimatedBudgetModule,
    LanguageFilterModule,
    BudgetFilterModule,
    StaticCheckBoxesModule,

    // Pipe
    TranslateSlugModule,
    DisplayNameModule,

    // Material
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatListModule,
    MatChipsModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatOptionModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class MovieListModule { }
