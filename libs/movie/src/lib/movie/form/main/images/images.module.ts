import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieFormImagesComponent } from './images.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';
import { MatCardModule } from '@angular/material/card';
import { ReferencePathModule } from '@blockframes/media/directives/media/reference-path.pipe';

@NgModule({
  declarations: [MovieFormImagesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CropperModule,
    ReferencePathModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
  ],
  exports: [MovieFormImagesComponent]
})
export class MovieFormImagesModule { }
