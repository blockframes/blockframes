import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageFilterComponent } from './language-filter.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { ScopeMultiselectModule } from '@blockframes/ui/static-autocomplete/scope/scope-multiselect.module';

// Material

@NgModule({
  declarations: [
    LanguageFilterComponent,
  ],
  exports: [
    LanguageFilterComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ScopeMultiselectModule,
    FlexLayoutModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ]
})
export class LanguageFilterModule { }
