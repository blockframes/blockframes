// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ExpenseTypePipeModule } from '../../../pipes/expense-type.pipe';

// Components
import { ExpenseFormComponent } from './form.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [ExpenseFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    FormTableModule,
    StaticSelectModule,
    ExpenseTypePipeModule,

    // Material
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  exports: [ExpenseFormComponent]
})
export class ExpenseFormModule { }
