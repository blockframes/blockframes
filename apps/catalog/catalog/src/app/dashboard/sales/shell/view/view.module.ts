import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SaleViewComponent } from './view.component';

@NgModule({
  declarations: [SaleViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ContractItemModule,
    HoldbackListModule,
    NegotiationPipeModule,
    //Material
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: SaleViewComponent, }]),
  ]
})
export class CatalogSaleViewModule { }
