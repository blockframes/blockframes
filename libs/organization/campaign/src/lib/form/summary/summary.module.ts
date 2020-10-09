import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProposalComponent } from './proposal/proposal.component';
import { PerksComponent } from './perks/perks.component';

import { MissingControlModule} from '@blockframes/ui/missing-control/missing-control.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { PerksPipeModule } from '../../pipes/perks.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ProposalComponent, PerksComponent],
  exports: [ProposalComponent, PerksComponent],
  imports: [
    CommonModule,
    ToLabelModule,
    PerksPipeModule,
    FlexLayoutModule,
    MissingControlModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ]
})
export class CampaignSummaryModule { }
