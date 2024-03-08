import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { DocumentComponent } from './document.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DetailedGroupModule } from '@blockframes/ui/detail-modal/detailed.module';
import { ToGroupLabelPipeModule, JoinPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { RightHolderNamePipeModule } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { ExpenseTypesFormModule } from '@blockframes/waterfall/components/forms/expense-types-form/form.module';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';
import { InterestTableModule } from '@blockframes/waterfall/components/interests-table/interest-table.module';
import { ContractMainInfoModule } from '@blockframes/waterfall/components/document/contract/contract-main-info/contract-main-info.module';
import { ContractPipeModule } from '@blockframes/contract/contract/pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DocumentComponent],
  imports: [
    CommonModule,
    ClipboardModule,

    TableModule,
    DetailedGroupModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    PricePerCurrencyModule,
    ToLabelModule,
    RightHolderNamePipeModule,
    ExpenseTypesFormModule,
    VersionSelectorModule,
    InterestTableModule,
    ContractMainInfoModule,
    ContractPipeModule,

    MatIconModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: DocumentComponent }])
  ]
})
export class DocumentModule { }
