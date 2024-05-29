import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { PdfViewerModule } from '@blockframes/media/pdf/viewer/viewer.module';
import { VideoViewerModule } from '@blockframes/media/video/viewer/viewer.module';
import { OpenPreviewComponent } from './open-preview.component';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { PreviewFileModalModule } from "../preview-file-modal/preview-file-modal.module"


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
    GlobalModalModule,
    PreviewFileModalModule
  ],
  exports: [OpenPreviewComponent],
  declarations: [OpenPreviewComponent],
})
export class OpenPreviewModule { }
