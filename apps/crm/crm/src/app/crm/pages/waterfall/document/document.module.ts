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

    MatIconModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: DocumentComponent }])
  ]
})
export class DocumentModule { }
