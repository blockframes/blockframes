import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ViewComponent } from './view.component';



@NgModule({
  declarations: [ViewComponent],
  exports: [ViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ViewComponent }])
  ]
})
export class DealViewModule { }
