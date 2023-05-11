import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScopeMultiselectComponent } from './scope-multiselect.component';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToLabelModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  declarations: [ScopeMultiselectComponent],
  exports: [ScopeMultiselectComponent],
})
export class ScopeMultiselectModule {}
