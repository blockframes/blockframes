import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PromotionalElementsImagesComponent } from './promotional-elements-images.component';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
@NgModule({
  declarations: [PromotionalElementsImagesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CropperModule,
    ImageReferenceModule
  ],
  exports: [PromotionalElementsImagesComponent]
})
export class PromotionalElementsImagesModule { }
