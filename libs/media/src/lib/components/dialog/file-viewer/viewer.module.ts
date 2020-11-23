import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ViewerDialogComponent } from './viewer.component';

import { PdfModule } from '@blockframes/media/components/pdf/pdf.module';
import { MediaPlayerModule } from '@blockframes/media/components/player/player.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,

    PdfModule,
    MediaPlayerModule,
    FileNameModule,
    ImageReferenceModule,

    MatDialogModule
  ],
  exports: [],
  declarations: [ViewerDialogComponent],
})
export class MediaViewerModule { }
