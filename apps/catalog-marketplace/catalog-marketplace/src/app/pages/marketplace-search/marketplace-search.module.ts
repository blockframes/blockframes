// Components
import { MovieDisplayCardItemComponent } from '@blockframes/movie/movie/components/display-card-item/display-card-item.component';

// Pages
import { MarketplaceSearchComponent } from './marketplace-search.component';

// Material
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatListModule } from '@angular/material';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MarketplaceSearchComponent, MovieDisplayCardItemComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
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
    MatDatepickerModule,

    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceSearchComponent
      }
    ])
  ]
})
export class MarketplaceSearchModule {}
