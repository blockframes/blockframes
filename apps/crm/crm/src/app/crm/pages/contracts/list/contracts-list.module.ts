import { NgModule } from '@angular/core';
import { ContractsListComponent } from './contracts-list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {SaleListModule} from '@blockframes/contract/contract/list/list.module'

@NgModule({
  declarations: [
    ContractsListComponent,
  ],
  imports: [
    CommonModule,
    SaleListModule,
    //Router
    RouterModule.forChild([{ path: '', component: ContractsListComponent }])
  ],
})
export class CrmContractsListModule { }
