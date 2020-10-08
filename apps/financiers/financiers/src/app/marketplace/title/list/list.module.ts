// Pages
import { ListComponent } from './list.component';
import { MovieCardModule } from "@blockframes/movie/components/card/card.module";
import { MovieDisplayListModule } from '@blockframes/movie/components/display-list/display-list.module';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { ChipsAutocompleteModule } from "@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module";
import { AlgoliaAutocompleteModule } from "@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module";
import { AlgoliaChipsAutocompleteModule } from "@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module";
import { ListPageModule } from "@blockframes/ui/list/page/list-page.module"
import { WishlistButtonModule } from "@blockframes/organization/components/wishlist-button/wishlist-button.module";
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
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
    ListPageModule,
    WishlistButtonModule,
    ListFilterModule,
    LanguageFilterModule,
    BudgetFilterModule,
    StaticCheckBoxesModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class MovieListModule { }
