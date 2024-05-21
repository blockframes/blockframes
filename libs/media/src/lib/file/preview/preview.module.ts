import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FilePreviewComponent } from './preview.component';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

import { PdfViewerModule } from '../../pdf/viewer/viewer.module';
import { VideoViewerModule } from '../../video/viewer/viewer.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { ImageModule } from '../../image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    GlobalModalModule,
    PdfViewerModule,
    VideoViewerModule,
    FileNameModule,
    ImageModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  exports: [FilePreviewComponent],
  declarations: [FilePreviewComponent],
})
export class FilePreviewModule { }
