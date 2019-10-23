import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropZoneDirective } from './drop-zone.directive';
import { ImageCropperModule } from 'ngx-image-cropper';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

// Components
import { CropperComponent } from './cropper/cropper.component';
import { HttpClientModule } from '@angular/common/http';
import { StorageImageDirective } from './storage-image.directive';

@NgModule({
  declarations: [DropZoneDirective, CropperComponent, StorageImageDirective],
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ImageCropperModule
  ],
  exports: [DropZoneDirective, CropperComponent, StorageImageDirective]
})
export class CropperModule {}
