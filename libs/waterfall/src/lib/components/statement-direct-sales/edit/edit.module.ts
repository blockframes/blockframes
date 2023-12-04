// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Blockframes
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { GroupMultiselectModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { StatementPeriodModule } from '../../statement-period/statement-period.module';
import { StatementHeaderModule } from '../../statement-header/statement-header.module';

// Components
import { StatementDirectSalesEditComponent } from './edit.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [StatementDirectSalesEditComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Blockframes
    FormTableModule,
    ToGroupLabelPipeModule,
    MaxLengthModule,
    JoinPipeModule,
    PricePerCurrencyModule,
    GroupMultiselectModule,
    StaticSelectModule,
    StatementPeriodModule,
    StatementHeaderModule,

    // Material
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
  ],
  exports: [StatementDirectSalesEditComponent]
})
export class StatementDirectSalesEditModule { }
