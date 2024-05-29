import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CampaignFormProposalComponent } from './proposal.component';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CampaignFormProposalComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    TunnelPageModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: CampaignFormProposalComponent }])
  ]
})
export class CampaignFormProposalModule { }
