import { NgModule } from '@angular/core';
import { ContractsListComponent } from './list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {ContractListModule} from '@blockframes/contract/contract/list/list.module'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    ContractsListComponent,
  ],
  imports: [
    CommonModule,
    ContractListModule,
    MatProgressSpinnerModule,
    //Router
    RouterModule.forChild([{ path: '', component: ContractsListComponent }])
  ],
})
export class CrmContractsListModule { }
