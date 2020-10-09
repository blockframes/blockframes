import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { TunnelSummaryComponent } from './summary.component';

import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { CampaignSummaryModule } from '@blockframes/campaign/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';
import { FromCamelCasePipeModule } from '@blockframes/utils/pipes/from-camel-calse.pipe';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';
import { SummaryFinancialDetailsModule } from './financial-details/financial-details.module'

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [TunnelSummaryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    MovieTunnelSummaryModule,
    CampaignSummaryModule,
    GetPathModule,
    FromCamelCasePipeModule,
    HasStatusModule,
    SummaryFinancialDetailsModule,
    // Materials
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: TunnelSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
