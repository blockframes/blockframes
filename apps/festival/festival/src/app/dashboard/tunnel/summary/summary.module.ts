import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { TunnelSummaryComponent } from './summary.component';

import { MovieTunnelSummaryModule } from '@blockframes/movie/form/summary/summary.module';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';
import { HasStatusModule } from '@blockframes/movie/pipes/has-status.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';
import { SnackbarLinkModule } from '@blockframes/ui/snackbar/link/snackbar-link.module';

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
    GetPathModule,
    HasStatusModule,
    ToLabelModule,
    SnackbarLinkModule,
    
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
