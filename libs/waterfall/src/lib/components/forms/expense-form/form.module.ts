// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ExpenseTypePipeModule } from '../../../pipes/expense-type.pipe';

// Components
import { ExpenseFormComponent } from './form.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';

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
