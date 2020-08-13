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
import { MatChipsModule } from '@angular/material/chips';

// Blockframes UI
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';

// Blockframes Utils
import { ToLabelModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

// Blockframes Media
import { EmptyImagePipeModule } from '@blockframes/media/directives/image-reference/image-reference.pipe';
import { MatDividerModule } from '@angular/material/divider';

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
    TranslateSlugModule,

    // Materials
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    RouterModule.forChild([{ path: '', component: MovieFormSummaryComponent }])
  ],
})
export class TunnelSummaryModule {}
