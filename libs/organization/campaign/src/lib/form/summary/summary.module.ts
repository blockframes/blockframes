import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SummaryProposalComponent } from './proposal/proposal.component';
import { SummaryPerksComponent } from './perks/perks.component';

import { MissingControlModule} from '@blockframes/ui/missing-control/missing-control.module';
import { ToLabelModule, NumberPipeModule, FileNameModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { PerksPipeModule, FundingsPipeModule } from '../../pipes';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SummaryFundingsComponent } from './fundings/fundings.component';
import { SummaryProfitsComponent } from './profits/profits.component';

@NgModule({
  declarations: [SummaryProposalComponent, SummaryPerksComponent, SummaryFundingsComponent, SummaryProfitsComponent],
  exports: [SummaryProposalComponent, SummaryPerksComponent, SummaryFundingsComponent, SummaryProfitsComponent],
  imports: [
    CommonModule,
    ToLabelModule,
    NumberPipeModule,
    FileNameModule,
    MaxLengthModule,
    PerksPipeModule,
    FundingsPipeModule,
    FlexLayoutModule,
    TableFilterModule,
    MissingControlModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ]
})
export class CampaignSummaryModule { }
