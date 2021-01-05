import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentComponent } from './investment.component';

import { CampaignSummaryModule } from '../../form/summary/summary.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [InvestmentComponent],
  imports: [
    CommonModule,
    CampaignSummaryModule,
    RouterModule.forChild([{ path: '', component: InvestmentComponent }])
  ]
})
export class InvestmentModule { }
