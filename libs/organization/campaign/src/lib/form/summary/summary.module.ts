import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposalComponent } from './proposal/proposal.component';
import { PerksComponent } from './perks/perks.component';



@NgModule({
  declarations: [ProposalComponent, PerksComponent],
  exports: [ProposalComponent, PerksComponent],
  imports: [
    CommonModule
  ]
})
export class CampaignSummaryModule { }
