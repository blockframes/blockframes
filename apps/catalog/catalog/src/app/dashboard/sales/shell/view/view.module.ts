import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { SaleViewComponent } from './view.component';

// Blockframes
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';
import { ConfirmWithValidationModule } from '@blockframes/contract/contract/components/confirm-with-validation/confirm-with-validation.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [SaleViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ContractItemModule,
    HoldbackListModule,
    NegotiationPipeModule,
    ConfirmWithValidationModule,
    LogoSpinnerModule,

    //Material
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: SaleViewComponent, }]),
  ]
})
export class CatalogSaleViewModule { }
