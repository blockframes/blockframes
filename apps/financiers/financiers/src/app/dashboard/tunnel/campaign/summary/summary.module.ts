import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { CampaignSummaryModule } from '@blockframes/campaign/form/summary/summary.module';

import { SummaryComponent } from './summary.component';

import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SummaryComponent],
  imports: [
    CommonModule,
    TunnelPageModule,
    FlexLayoutModule,
    CampaignSummaryModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: SummaryComponent }])
  ]
})
export class SummaryModule { }
