import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';
import { ConfirmDeclineComponentModule } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.module';

import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ExternalSaleComponent } from './external.component';

@NgModule({
  declarations: [ExternalSaleComponent],
  imports: [
    CommonModule,
    ContractItemModule,
    HoldbackListModule,
    ConfirmDeclineComponentModule,

    //Material
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSelectModule,
    RouterModule.forChild([{ path: '', component: ExternalSaleComponent, }]),
  ]
})
export class ExternalSaleModule { }
