import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropZoneDirective } from './drop-zone.directive';
import { ImageCropperModule } from 'ngx-image-cropper';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { CropperComponent } from './cropper/cropper.component';

@NgModule({
  declarations: [DropZoneDirective, CropperComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImageCropperModule
  ],
  exports: [DropZoneDirective, CropperComponent]
})
export class CropperModule {}
