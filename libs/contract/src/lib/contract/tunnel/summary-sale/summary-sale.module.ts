import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SummarySaleComponent } from './summary-sale.component';



@NgModule({
  declarations: [SummarySaleComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SummarySaleComponent }])
  ]
})
export class SummarySaleModule { }
