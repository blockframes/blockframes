import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

import { MediaViewerComponent } from './media-viewer.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';

@NgModule({
  declarations: [
    MediaViewerComponent,
    PdfViewerComponent,
  ],
  imports: [
    CommonModule,

    MatProgressSpinnerModule,

    FileNameModule,
    ImageReferenceModule,
  ],
  exports: [ MediaViewerComponent ],
})
export class MediaViewerModule {}
