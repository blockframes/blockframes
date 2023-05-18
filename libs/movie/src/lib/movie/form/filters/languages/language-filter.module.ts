import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageFilterComponent } from './language-filter.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
