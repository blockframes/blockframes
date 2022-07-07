import { NgModule } from '@angular/core';
import { ContractsListComponent } from './list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExternalSaleListModule } from '@blockframes/contract/contract/list/external-sales/external-sale.module'
import { MandatesListModule } from '@blockframes/contract/contract/list/mandates/mandates.module'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    ContractsListComponent,
  ],
  imports: [
    CommonModule,
    ExternalSaleListModule,
    MandatesListModule,
    MatProgressSpinnerModule,
    //Router
    RouterModule.forChild([{ path: '', component: ContractsListComponent }])
  ],
})
export class CrmContractsListModule { }
