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
import { StatementPeriodModule } from '@blockframes/waterfall/components/statement-period/statement-period.module';

// Components
import { StatementDistributorEditComponent } from './edit.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [StatementDistributorEditComponent],
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

    // Material
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDialogModule,
  ],
  exports: [StatementDistributorEditComponent]
})
export class StatementDistributorEditModule { }
