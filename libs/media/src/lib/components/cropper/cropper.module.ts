import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';

// Components
import { CropperComponent } from '@blockframes/media/components/cropper/cropper.component';
import { ImageReferenceModule } from '../../directives/image-reference/image-reference.module';

@NgModule({
  declarations: [CropperComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageCropperModule,
    ImageReferenceModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ClipboardModule
  ],
  exports: [CropperComponent]
})
export class CropperModule { }
