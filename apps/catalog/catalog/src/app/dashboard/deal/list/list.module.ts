import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DealListComponent } from './list.component';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

import { RouterModule } from '@angular/router';

// Material
import { MatTabsModule } from '@angular/material/tabs';


@NgModule({
  declarations: [DealListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableFilterModule,

    // Material
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: DealListComponent }])
  ]
})
export class DealListModule { }
