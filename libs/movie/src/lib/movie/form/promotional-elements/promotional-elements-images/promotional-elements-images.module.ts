import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PromotionalElementsImagesComponent } from './promotional-elements-images.component';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
@NgModule({
  declarations: [PromotionalElementsImagesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CropperModule
  ],
  exports: [PromotionalElementsImagesComponent]
})
export class PromotionalElementsImagesModule { }
