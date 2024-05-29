import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { ImageModule } from '../../image/directives/image.module';

// Components
import { ImageUploaderComponent } from './uploader.component';
import { ReferencePipe } from '../uploader/reference-path.pipe';
import { DownloadPipeModule } from '@blockframes/media/file/pipes/download.pipe';

@NgModule({
  declarations: [ ImageUploaderComponent, ReferencePipe ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageCropperModule,
    ImageModule,
    DownloadPipeModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ClipboardModule
  ],
  exports: [ ImageUploaderComponent, ReferencePipe ]
})
export class ImageUploaderModule { }
