import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropZoneDirective } from './drop-zone.directive';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StorageImageModule } from './storage-image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { CropperComponent } from './cropper/cropper.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [DropZoneDirective, CropperComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    ImageCropperModule,
    StorageImageModule,
    FlexLayoutModule
  ],
  exports: [DropZoneDirective, CropperComponent]
})
export class CropperModule {}
