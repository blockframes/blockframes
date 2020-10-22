import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FinancingComponent } from './financing.component';
import { CampaignSummaryModule } from '../../form/summary/summary.module';



@NgModule({
  declarations: [FinancingComponent],
  imports: [
    CommonModule,
    CampaignSummaryModule,
    RouterModule.forChild([{ path: '', component: FinancingComponent }])
  ]
})
export class FinancingModule { }
