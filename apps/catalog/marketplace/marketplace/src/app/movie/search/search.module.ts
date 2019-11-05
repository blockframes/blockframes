// Components
import { MovieCardModule } from "@blockframes/ui";
import { MovieDisplayListModule } from '@blockframes/movie/movie/components/display-list/display-list.module';
import { TranslateSlugModule } from "@blockframes/utils/pipes/translate-slug.module";

// Pages
import { MarketplaceSearchComponent } from './search.component';

// Material
import { MatNativeDateModule } from '@angular/material/core';
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

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MarketplaceSearchComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    HttpClientModule,
    MovieCardModule,
    MovieDisplayListModule,
    TranslateSlugModule,

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
    MatNativeDateModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatOptionModule,

    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceSearchComponent
      }
    ])
  ]
})
export class MarketplaceSearchModule {}
