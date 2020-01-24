import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealListComponent } from './list.component';

import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [DealListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: DealListComponent }])
  ]
})
export class DealListModule { }
