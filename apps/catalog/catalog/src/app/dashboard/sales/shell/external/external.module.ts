import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';
import { ConfirmDeclineComponentModule } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.module';

// Component
import { ExternalSaleComponent } from './external.component';

// Material
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [ExternalSaleComponent],
  imports: [
    CommonModule,
    ContractItemModule,
    HoldbackListModule,
    ConfirmDeclineComponentModule,
    LogoSpinnerModule,

    //Material
    MatDialogModule,
    MatSelectModule,
    RouterModule.forChild([{ path: '', component: ExternalSaleComponent }]),
  ]
})
export class ExternalSaleModule { }
