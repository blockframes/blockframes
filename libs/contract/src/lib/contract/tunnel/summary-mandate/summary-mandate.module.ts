import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SummaryMandateComponent } from './summary-mandate.component';



@NgModule({
  declarations: [SummaryMandateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SummaryMandateComponent }])
  ]
})
export class SummaryMandateModule { }
