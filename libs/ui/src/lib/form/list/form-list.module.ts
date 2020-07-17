// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormListComponent } from './form-list.component';
import { FormListTableModule } from './table/form-list-table.module';

@NgModule({
  imports: [
    CommonModule,

    // Components
    FormListTableModule
  ],
  declarations: [FormListComponent],
  exports: [FormListComponent]
})
export class FormListModule { }
