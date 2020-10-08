import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { CampaignSummaryModule } from '@blockframes/campaign/form/summary/summary.module';

import { SummaryComponent } from './summary.component';

@NgModule({
  declarations: [SummaryComponent],
  imports: [
    CommonModule,
    TunnelPageModule,
    CampaignSummaryModule,
    RouterModule.forChild([{ path: '', component: SummaryComponent }])
  ]
})
export class SummaryModule { }
