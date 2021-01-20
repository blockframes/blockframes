
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

import { PdfViewerModule } from '../../pdf/viewer/viewer.module';
import { PdfControlModule } from '../../pdf/control/control.module';
import { VideoViewerModule } from '../../video/viewer/viewer.module';

import { FileViewersComponent } from './viewers.component';

@NgModule({
  declarations: [ FileViewersComponent ],
  imports: [
    CommonModule,

    FileNameModule,
    ImageModule,
    PdfControlModule,
    PdfViewerModule,
    VideoViewerModule,
  ],
  exports: [ FileViewersComponent ],
})
export class FileViewersModule {}
