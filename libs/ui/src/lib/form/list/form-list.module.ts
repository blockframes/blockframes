// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'

// Components
import { FormListComponent, FormViewDirective } from './form-list.component';
import { FormListTableModule } from './table/form-list-table.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Component
    FormListTableModule,

    // Material
    MatButtonModule,
    MatIconModule
  ],
  declarations: [FormListComponent, FormViewDirective],
  exports: [FormListComponent, FormListTableModule, FormViewDirective]
})
export class FormListModule { }
