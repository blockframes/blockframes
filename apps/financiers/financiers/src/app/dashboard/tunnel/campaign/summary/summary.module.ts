import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { CampaignSummaryModule } from '@blockframes/campaign/form/summary/summary.module';

import { SummaryComponent } from './summary.component';

@NgModule({
  declarations: [SummaryComponent],
  imports: [
    CommonModule,
    TunnelPageModule,
    CampaignSummaryModule
  ]
})
export class SummaryModule { }
