// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ExpenseTypePipeModule } from '../../../pipes/expense-type.pipe';
import { ExpenseTypesFormModule } from '../../forms/expense-types-form/form.module';

// Components
import { ExpenseFormComponent } from './form.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [ExpenseFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    FormTableModule,
    PricePerCurrencyModule,
    StaticSelectModule,
    ExpenseTypePipeModule,
    ExpenseTypesFormModule,

    // Material
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  exports: [ExpenseFormComponent]
})
export class ExpenseFormModule { }
