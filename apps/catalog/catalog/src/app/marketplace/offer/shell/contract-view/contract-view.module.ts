import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ContractViewComponent } from './contract-view.component';

import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe'
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ContractViewComponent
  ],
  imports: [
    CommonModule,
    ContractItemModule,
    HoldbackListModule,
    NegotiationPipeModule,
    MatButtonModule,
    MatButtonModule,
    FlexLayoutModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: ContractViewComponent }])
  ]
})
export class ContractViewModule { }
