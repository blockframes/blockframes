import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { DocumentComponent } from './document.component';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { ExpenseTypesFormModule } from '@blockframes/waterfall/components/forms/expense-types-form/form.module';
import { InterestTableModule } from '@blockframes/waterfall/components/interests-table/interest-table.module';
import { ContractMainInfoModule } from '@blockframes/waterfall/components/document/contract/contract-main-info/contract-main-info.module';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DocumentComponent],
  imports: [
    BfCommonModule,
    ClipboardModule,

    TableModule,
    PricePerCurrencyModule,
    RightHolderNamePipeModule,
    ExpenseTypesFormModule,
    InterestTableModule,
    ContractMainInfoModule,
    ContractPipeModule,

    MatIconModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: DocumentComponent }])
  ]
})
export class DocumentModule { }
