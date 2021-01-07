import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { PdfModule } from '@blockframes/media/components/pdf/pdf.module';
import { MediaPlayerModule } from '@blockframes/media/components/player/player.module';
import { PreviewModalComponent } from './preview.component';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    ImageReferenceModule,
    FileNameModule,
    PdfModule,
    MediaPlayerModule,
  ],
  exports: [PreviewModalComponent],
  declarations: [PreviewModalComponent],
})
export class PreviewModalModule { }
