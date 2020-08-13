import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormSummaryComponent } from './summary.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Blockframes UI
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

// Blockframes Utils
import { ToLabelModule } from '@blockframes/utils/pipes';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

// Blockframes Media
import { EmptyImagePipeModule } from '@blockframes/media/directives/image-reference/image-reference.pipe';

@NgModule({
  declarations: [MovieFormSummaryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,

    // Summary components
    MissingControlModule,
    ToLabelModule,
    EmptyImagePipeModule,
    FileNameModule,
    FlexLayoutModule,
    DurationModule,

    // Materials
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: MovieFormSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
