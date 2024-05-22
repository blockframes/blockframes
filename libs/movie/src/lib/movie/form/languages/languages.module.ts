import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LanguagesFormComponent } from './languages.component';
import { FormListModule } from '@blockframes/ui/form/list/form-list.module';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { InputAutocompleteModule } from '@blockframes/ui/static-autocomplete/input/input-autocomplete.module';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [LanguagesFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormListModule,
    ToLabelModule,
    InputAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatTooltipModule,
  ],
  exports: [LanguagesFormComponent]
})
export class LanguagesFormModule { }
