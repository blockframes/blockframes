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
import { ClipboardModule } from '@angular/cdk/clipboard';

// Components
import { CropperComponent } from '@blockframes/media/components/cropper/cropper.component';
import { HttpClientModule } from '@angular/common/http';
import { ImageReferenceModule } from '../../directives/image-reference/image-reference.module';

@NgModule({
  declarations: [DropZoneDirective, CropperComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FlexLayoutModule,
    ImageCropperModule,
    ImageReferenceModule,

    // Material
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    ClipboardModule
  ],
  exports: [DropZoneDirective, CropperComponent]
})
export class CropperModule { }
