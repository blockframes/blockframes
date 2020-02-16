import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ListComponent } from './list.component';


@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class DealListModule { }
