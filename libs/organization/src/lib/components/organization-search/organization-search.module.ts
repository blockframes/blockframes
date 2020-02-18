import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { OrganizationSearchComponent } from './organization-search.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

const material = [MatFormFieldModule, MatIconModule, MatSelectModule, MatAutocompleteModule, MatInputModule];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule,FormsModule, ...material],
  declarations: [OrganizationSearchComponent],
  exports: [OrganizationSearchComponent]
})
export class OrganizationSearchModule {}
