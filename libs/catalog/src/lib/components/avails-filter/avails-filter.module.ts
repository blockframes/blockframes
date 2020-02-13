import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

import { AvailsFilterComponent } from './avails-filter.component';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [AvailsFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TranslateSlugModule,

    // Material
    MatExpansionModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatIconModule,
    MatSlideToggleModule,
    MatNativeDateModule,
    MatButtonModule,
    MatInputModule,
    MatOptionModule
  ],
  exports: [AvailsFilterComponent]
})
export class AvailsFilterModule {}
