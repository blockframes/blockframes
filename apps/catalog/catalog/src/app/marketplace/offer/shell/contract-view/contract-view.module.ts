import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractViewComponent } from './contract-view.component';
import { RouterModule } from '@angular/router';

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
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: ContractViewComponent }])
  ]
})
export class ContractViewModule { }
