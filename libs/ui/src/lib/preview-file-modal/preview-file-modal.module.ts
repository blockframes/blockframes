import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { PdfViewerModule } from '@blockframes/media/pdf/viewer/viewer.module';
import { VideoViewerModule } from '@blockframes/media/video/viewer/viewer.module';
import { PreviewFileModalComponent } from './preview-file-modal.component';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    ImageModule,
    FileNameModule,
    PdfViewerModule,
    VideoViewerModule,
    GlobalModalModule
  ],
  exports: [PreviewFileModalComponent],
  declarations: [PreviewFileModalComponent],
})
export class PreviewFileModalModule { }
