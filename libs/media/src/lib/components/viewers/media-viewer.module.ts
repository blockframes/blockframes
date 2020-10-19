import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

import { MediaViewerComponent } from './media-viewer.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { VideoViewerComponent } from './video-viewer/video-viewer.component';

@NgModule({
  declarations: [
    MediaViewerComponent,
    PdfViewerComponent,
    VideoViewerComponent,
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,

    FileNameModule,
    ImageReferenceModule,
  ],
  exports: [ MediaViewerComponent ],
})
export class MediaViewerModule {}
