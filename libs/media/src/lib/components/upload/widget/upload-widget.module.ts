// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { UploadWidgetComponent } from './upload-widget.component';

// Blockframes
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { TaskProgressModule } from '../../../pipes/task-progress.pipe';
import { TaskSnapshotModule } from '../../../pipes/task-state.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Pipe
    MaxLengthModule,
    TaskProgressModule,
    TaskSnapshotModule,
    FileNameModule,

    // Blockframes
    ImageReferenceModule,

    // Material
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDividerModule
  ],
  exports: [UploadWidgetComponent],
  declarations: [UploadWidgetComponent],
})
export class UploadWidgetModule { }
