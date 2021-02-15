import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FilePreviewComponent } from './preview.component';

import { PdfViewerModule } from '../../pdf/viewer/viewer.module';
import { VideoViewerModule } from '../../video/viewer/viewer.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { ImageModule } from '../../image/directives/image.module';

// Material
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,

    PdfViewerModule,
    VideoViewerModule,
    FileNameModule,
    ImageModule,

    MatDialogModule
  ],
  exports: [],
  declarations: [FilePreviewComponent],
})
export class FilePreviewModule { }
