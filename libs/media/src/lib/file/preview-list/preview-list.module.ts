import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FileListPreviewComponent } from './preview-list.component';

import { PdfViewerModule } from '../../pdf/viewer/viewer.module';
import { VideoViewerModule } from '../../video/viewer/viewer.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { ImageModule } from '../../image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    PdfViewerModule,
    VideoViewerModule,
    FileNameModule,
    ImageModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  exports: [FileListPreviewComponent],
  declarations: [FileListPreviewComponent],
})
export class FileListPreviewModule { }
