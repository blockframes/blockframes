import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProposalComponent } from './proposal/proposal.component';
import { PerksComponent } from './perks/perks.component';

import { MissingControlModule} from '@blockframes/ui/missing-control/missing-control.module';
import { ToLabelModule, NumberPipeModule, FileNameModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { PerksPipeModule, FundingsPipeModule } from '../../pipes';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FundingsComponent } from './fundings/fundings.component';
import { ProfitsComponent } from './profits/profits.component';

@NgModule({
  declarations: [ProposalComponent, PerksComponent, FundingsComponent, ProfitsComponent],
  exports: [ProposalComponent, PerksComponent, FundingsComponent, ProfitsComponent],
  imports: [
    CommonModule,
    ToLabelModule,
    NumberPipeModule,
    FileNameModule,
    MaxLengthModule,
    PerksPipeModule,
    FundingsPipeModule,
    FlexLayoutModule,
    MissingControlModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ]
})
export class CampaignSummaryModule { }
