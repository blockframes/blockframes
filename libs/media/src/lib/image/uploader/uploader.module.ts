import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Components
import { ImageUploaderComponent } from './uploader.component';
import { ReferencePipe } from './reference-path.pipe';

@NgModule({
  declarations: [ ImageUploaderComponent, ReferencePipe ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageCropperModule,
    ImageModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ClipboardModule
  ],
  exports: [ ImageUploaderComponent, ReferencePipe ]
})
export class ImageUploaderModule { }
