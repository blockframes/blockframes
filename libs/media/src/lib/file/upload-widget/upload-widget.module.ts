// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { TaskProgressPipe, TaskStatePipe } from './task.pipe';
import { UploadWidgetComponent } from './upload-widget.component';

// Blockframes
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { ImageModule } from '../../image/directives/image.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Pipe
    MaxLengthModule,
    FileNameModule,

    // Blockframes
    ImageModule,

    // Material
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDividerModule
  ],
  exports: [UploadWidgetComponent],
  declarations: [ UploadWidgetComponent, TaskProgressPipe, TaskStatePipe ],
})
export class UploadWidgetModule { }
