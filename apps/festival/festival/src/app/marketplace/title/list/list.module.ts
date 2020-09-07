// Components
import { MovieCardModule } from "@blockframes/movie/components/card/card.module";
import { MovieDisplayListModule } from '@blockframes/movie/components/display-list/display-list.module';

// Pipes
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.pipe";
import { TranslateSlugModule } from "@blockframes/utils/pipes/translate-slug.pipe";

// Pages
import { ListComponent } from './list.component';

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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ChipsAutocompleteModule } from "@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module";
import { AlgoliaAutocompleteModule } from "@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module";
import { AlgoliaChipsAutocompleteModule } from "@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module";
import { TitleListLayoutModule } from "@blockframes/movie/layout/list/title-list.module"
import { WishlistButtonModule } from "@blockframes/organization/components/wishlist-button/wishlist-button.module";
import { TitleFilterModule } from '@blockframes/movie/components/title-filter/title-filter.module';
import { LanguageFilterModule } from '@blockframes/movie/form/filters/languages/language-filter.module';
import { BudgetFilterModule } from '@blockframes/movie/form/filters/budget/budget.module';
import { StaticCheckBoxesModule } from '@blockframes/ui/static-autocomplete/check-boxes/check-boxes.module';

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
    LanguageFilterModule,
    BudgetFilterModule,
    StaticCheckBoxesModule,
    ScrollingModule,

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
    MatProgressBarModule,
    MatPaginatorModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class MovieListModule { }
