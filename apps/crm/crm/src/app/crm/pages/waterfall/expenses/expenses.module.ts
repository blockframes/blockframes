import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ExpensesComponent } from './expenses.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';
import { ExpenseTypePipeModule } from '@blockframes/waterfall/pipes/expense-type.pipe';
import { ExpenseTypesFormModule } from '@blockframes/waterfall/components/forms/expense-types-form/form.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    BfCommonModule,

    TableModule,
    PricePerCurrencyModule,
    RightHolderNamePipeModule,
    ContractPipeModule,
    ExpenseTypePipeModule,
    ExpenseTypesFormModule,
    VersionSelectorModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,

    // remove
    RouterModule.forChild([{ path: '', component: ExpensesComponent }])
  ]
})
export class ExpensesModule { }
