import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Components
import { MoviePictureUploadComponent } from './picture-upload.component';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    ImageUploaderModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [MoviePictureUploadComponent],
  exports: [MoviePictureUploadComponent]
})
export class MoviePictureUploadModule { }
