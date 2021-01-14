import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FilePreviewComponent } from './preview.component';

import { PdfModule } from '@blockframes/media/components/pdf/pdf.module';
import { MediaPlayerModule } from '@blockframes/media/components/player/player.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,

    PdfModule,
    MediaPlayerModule,
    FileNameModule,
    ImageModule,

    MatDialogModule
  ],
  exports: [],
  declarations: [FilePreviewComponent],
})
export class FilePreviewModule { }
