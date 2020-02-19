import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DealListComponent } from './list.component';
import { ContractTableModule } from '@blockframes/contract/contract/components';

import { RouterModule } from '@angular/router';

// Material
import { MatTabsModule } from '@angular/material/tabs';


@NgModule({
  declarations: [DealListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContractTableModule,

    // Material
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: DealListComponent }])
  ]
})
export class DealListModule { }
