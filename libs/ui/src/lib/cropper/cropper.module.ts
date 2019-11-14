import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropZoneDirective } from './drop-zone.directive';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { CropperComponent } from './cropper/cropper.component';
import { HttpClientModule } from '@angular/common/http';
import { ImageReferenceDirective } from './image-reference.directive';

@NgModule({
  declarations: [DropZoneDirective, CropperComponent, ImageReferenceDirective],
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    ImageCropperModule,
    FlexLayoutModule
  ],
  exports: [DropZoneDirective, CropperComponent, ImageReferenceDirective]
})
export class CropperModule {}
