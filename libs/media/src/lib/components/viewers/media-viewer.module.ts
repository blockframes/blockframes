import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

import { MediaViewerComponent } from './media-viewer.component';

@NgModule({
  declarations: [
    MediaViewerComponent,
  ],
  imports: [
    CommonModule,

    FileNameModule,
    ImageReferenceModule,
  ],
  exports: [ MediaViewerComponent ],
})
export class MediaViewerModule {}
