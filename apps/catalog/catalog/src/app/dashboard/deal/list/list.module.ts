import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';

import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class DealListModule { }
