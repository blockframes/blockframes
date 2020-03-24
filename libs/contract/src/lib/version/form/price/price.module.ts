// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { PriceComponent } from './price.component';
import { MovieBannerModule } from '@blockframes/movie/components/banner';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia-autocomplete/algolia-autocomplete.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Components
    MovieBannerModule,
    StaticSelectModule,
    AlgoliaAutocompleteModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDividerModule
  ],
  declarations: [PriceComponent],
  exports: [PriceComponent]
})
export class ContractVersionFormPriceModule { }
