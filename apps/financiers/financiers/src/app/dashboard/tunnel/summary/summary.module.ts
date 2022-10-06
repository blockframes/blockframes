import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { TunnelSummaryComponent } from './summary.component';

import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { CampaignSummaryModule } from '@blockframes/campaign/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [TunnelSummaryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    MovieTunnelSummaryModule,
    CampaignSummaryModule,
    GetPathModule,
    HasStatusModule,
    ConfirmInputModule,
    ToLabelModule,

    // Materials
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: TunnelSummaryComponent }])
  ],
})
export class TunnelSummaryModule { }
