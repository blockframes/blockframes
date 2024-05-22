import { NgModule } from '@angular/core';
import { ContractsListComponent } from './list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Blockframes
import { ExternalSaleListModule } from '@blockframes/contract/contract/list/external-sales/external-sale.module'
import { MandatesListModule } from '@blockframes/contract/contract/list/mandates/mandates.module'

// Material
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ContractsListComponent,
  ],
  imports: [
    CommonModule,
    ExternalSaleListModule,
    MandatesListModule,
    // Material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    // Router
    RouterModule.forChild([{ path: '', component: ContractsListComponent }])
  ],
})
export class CrmContractsListModule { }
