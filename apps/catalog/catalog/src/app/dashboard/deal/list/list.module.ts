import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DealListComponent } from './list.component';
import { ContractListModule } from '@blockframes/contract/contract/list/contract-list.module';

import { RouterModule } from '@angular/router';

// Material
import { MatTabsModule } from '@angular/material/tabs';


@NgModule({
  declarations: [DealListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContractListModule,

    // Material
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: DealListComponent }])
  ]
})
export class DealListModule { }
