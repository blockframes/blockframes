import { MovieFormVersionInfoComponent } from './version-info.component';

// Angular
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TranslateSlugModule } from '@blockframes/utils/pipes';
import { FormLanguageModule } from '@blockframes/ui/form';

// Materials
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [MovieFormVersionInfoComponent],
  imports: [
    // Angular
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    TranslateSlugModule,
    FormLanguageModule,

    // Materials
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
  ],
  exports: [MovieFormVersionInfoComponent]
})
export class MovieFormVersionInfoModule {}
